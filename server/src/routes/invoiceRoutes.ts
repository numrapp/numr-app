import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { queryAll, queryOne, run } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateInvoiceNumber } from '../utils/invoiceNumber';
import { generateInvoicePDF, InvoiceData } from '../services/pdfService';
import { sendInvoiceEmail } from '../services/emailService';

const router = Router();
router.use(authMiddleware);

const UPLOADS_DIR = path.join(__dirname, '../../../uploads');

function buildPdfData(user: any, client: any, invoice: any, items: any[]): InvoiceData {
  return {
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.invoice_date,
    dueDate: invoice.due_date,
    deliveryDate: invoice.delivery_date,
    paymentDays: invoice.payment_terms_days,
    supplierName: user.company_name,
    supplierAddress: user.company_address,
    supplierPostcode: user.company_postcode,
    supplierCity: user.company_city,
    supplierKvk: user.kvk_number,
    supplierBtw: user.btw_number,
    supplierIban: user.iban,
    supplierPhone: user.phone,
    supplierEmail: user.email || user.smtp_user || '',
    supplierLogo: user.logo_path || undefined,
    customerName: client.company_name,
    customerAddress: client.address,
    customerPostcode: client.postcode,
    customerCity: client.city,
    customerCountry: client.country,
    customerKvk: client.kvk_number || '',
    customerBtw: client.btw_number || '',
    items: items.map(i => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      btwRate: i.btw_rate,
      btwAmount: i.btw_amount,
      lineTotal: i.line_total,
    })),
    subtotal: invoice.subtotal,
    btwAmount: invoice.btw_amount,
    total: invoice.total,
    description: invoice.description || '',
  };
}

router.get('/', (req: AuthRequest, res) => {
  try {
    const invoices = queryAll(
      `SELECT i.*, c.company_name as client_name, c.email as client_email
       FROM invoices i LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.user_id = ? ORDER BY i.created_at DESC`,
      [req.userId!]
    );
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req: AuthRequest, res) => {
  try {
    const invoice = queryOne('SELECT * FROM invoices WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const items = queryAll('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoice.id]);
    const client = queryOne('SELECT * FROM clients WHERE id = ?', [invoice.client_id]);

    res.json({ ...invoice, items, client });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { client_id, invoice_date, delivery_date, due_date, payment_terms_days, description, items } = req.body;

    if (!client_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Client and at least one item are required' });
    }

    const user = queryOne('SELECT * FROM users WHERE id = ?', [req.userId!]);
    const client = queryOne('SELECT * FROM clients WHERE id = ? AND user_id = ?', [client_id, req.userId!]);

    if (!client) return res.status(404).json({ error: 'Client not found' });

    const invoiceNumber = generateInvoiceNumber(req.userId!);

    let subtotal = 0;
    let totalBtw = 0;
    const processedItems = items.map((item: any) => {
      const lineSubtotal = item.quantity * item.unit_price;
      const btwAmount = lineSubtotal * (item.btw_rate / 100);
      const lineTotal = lineSubtotal + btwAmount;
      subtotal += lineSubtotal;
      totalBtw += btwAmount;
      return { ...item, btw_amount: Math.round(btwAmount * 100) / 100, line_total: Math.round(lineTotal * 100) / 100 };
    });

    subtotal = Math.round(subtotal * 100) / 100;
    totalBtw = Math.round(totalBtw * 100) / 100;
    const total = Math.round((subtotal + totalBtw) * 100) / 100;

    run(
      `INSERT INTO invoices (user_id, client_id, invoice_number, invoice_date, delivery_date, due_date, payment_terms_days, description, subtotal, btw_amount, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [req.userId!, client_id, invoiceNumber, invoice_date, delivery_date, due_date, payment_terms_days || 30, description || '', subtotal, totalBtw, total]
    );

    const inserted = queryOne('SELECT id FROM invoices WHERE invoice_number = ?', [invoiceNumber]);
    const invoiceId = inserted.id;

    for (const item of processedItems) {
      run(
        `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, btw_rate, btw_amount, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, item.description, item.quantity, item.unit_price, item.btw_rate, item.btw_amount, item.line_total]
      );
    }

    const invoice = queryOne('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    const savedItems = queryAll('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoiceId]);

    const pdfData = buildPdfData(user, client, invoice, savedItems);
    const pdfBuffer = await generateInvoicePDF(pdfData);

    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const pdfPath = path.join(UPLOADS_DIR, `${invoiceNumber}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

    run('UPDATE invoices SET pdf_path = ? WHERE id = ?', [pdfPath, invoiceId]);

    res.status(201).json({ ...invoice, items: savedItems, client, pdf_path: pdfPath });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/send', async (req: AuthRequest, res) => {
  try {
    const invoice = queryOne('SELECT * FROM invoices WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const user = queryOne('SELECT * FROM users WHERE id = ?', [req.userId!]);
    const client = queryOne('SELECT * FROM clients WHERE id = ?', [invoice.client_id]);
    const items = queryAll('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoice.id]);

    if (!client.email) {
      return res.status(400).json({ error: 'Client has no email address' });
    }

    if (!user.smtp_host || !user.smtp_user) {
      return res.status(400).json({ error: 'SMTP settings not configured. Go to Settings to configure email.' });
    }

    let pdfBuffer: Buffer;
    if (invoice.pdf_path && fs.existsSync(invoice.pdf_path)) {
      pdfBuffer = fs.readFileSync(invoice.pdf_path);
    } else {
      const pdfData = buildPdfData(user, client, invoice, items);
      pdfBuffer = await generateInvoicePDF(pdfData);
    }

    const totalFormatted = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(invoice.total);

    await sendInvoiceEmail({
      config: { host: user.smtp_host, port: user.smtp_port, user: user.smtp_user, pass: user.smtp_pass },
      to: client.email,
      supplierName: user.company_name,
      customerName: client.company_name,
      invoiceNumber: invoice.invoice_number,
      total: totalFormatted,
      pdfBuffer,
    });

    run("UPDATE invoices SET status = 'sent', sent_at = datetime('now') WHERE id = ?", [invoice.id]);

    res.json({ message: 'Invoice sent successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/pdf', async (req: AuthRequest, res) => {
  try {
    const invoice = queryOne('SELECT * FROM invoices WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    if (invoice.pdf_path && fs.existsSync(invoice.pdf_path)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoice_number}.pdf"`);
      return res.send(fs.readFileSync(invoice.pdf_path));
    }

    const user = queryOne('SELECT * FROM users WHERE id = ?', [req.userId!]);
    const client = queryOne('SELECT * FROM clients WHERE id = ?', [invoice.client_id]);
    const items = queryAll('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoice.id]);

    const pdfData = buildPdfData(user, client, invoice, items);
    const pdfBuffer = await generateInvoicePDF(pdfData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoice_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'sent', 'paid'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const invoice = queryOne('SELECT * FROM invoices WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    run('UPDATE invoices SET status = ? WHERE id = ?', [status, invoice.id]);
    res.json({ ...invoice, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const invoice = queryOne('SELECT * FROM invoices WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const { invoice_number, invoice_date, description, items, subtotal, btw_amount, total } = req.body;

    run('UPDATE invoices SET invoice_number=?, invoice_date=?, description=?, subtotal=?, btw_amount=?, total=? WHERE id=?',
      [invoice_number || invoice.invoice_number, invoice_date || invoice.invoice_date, description ?? invoice.description, subtotal ?? invoice.subtotal, btw_amount ?? invoice.btw_amount, total ?? invoice.total, invoice.id]);

    if (items && Array.isArray(items)) {
      run('DELETE FROM invoice_items WHERE invoice_id = ?', [invoice.id]);
      for (const item of items) {
        const lineSubtotal = (item.quantity || 0) * (item.unit_price || 0);
        const itemBtw = lineSubtotal * ((item.btw_rate || 0) / 100);
        run('INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, btw_rate, btw_amount, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [invoice.id, item.description || '', item.quantity || 0, item.unit_price || 0, item.btw_rate || 0, Math.round(itemBtw * 100) / 100, Math.round((lineSubtotal + itemBtw) * 100) / 100]);
      }
    }

    const user = queryOne('SELECT * FROM users WHERE id = ?', [req.userId!]);
    const client = queryOne('SELECT * FROM clients WHERE id = ?', [invoice.client_id]);
    const updatedInvoice = queryOne('SELECT * FROM invoices WHERE id = ?', [invoice.id]);
    const savedItems = queryAll('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoice.id]);

    const pdfData = buildPdfData(user, client, updatedInvoice, savedItems);
    const pdfBuffer = await generateInvoicePDF(pdfData);
    const pdfPath = path.join(UPLOADS_DIR, `${updatedInvoice.invoice_number}.pdf`);
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    fs.writeFileSync(pdfPath, pdfBuffer);
    run('UPDATE invoices SET pdf_path = ? WHERE id = ?', [pdfPath, invoice.id]);

    res.json({ ...updatedInvoice, items: savedItems });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req: AuthRequest, res) => {
  try {
    const invoice = queryOne('SELECT * FROM invoices WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    run('DELETE FROM invoice_items WHERE invoice_id = ?', [invoice.id]);
    run('DELETE FROM invoices WHERE id = ?', [invoice.id]);

    if (invoice.pdf_path && fs.existsSync(invoice.pdf_path)) {
      fs.unlinkSync(invoice.pdf_path);
    }

    res.json({ message: 'Invoice deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
