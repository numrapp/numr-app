import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { queryAll, queryOne, run } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateInvoicePDF, InvoiceData } from '../services/pdfService';
import { generateInvoiceNumber } from '../utils/invoiceNumber';

const router = Router();
router.use(authMiddleware);

const UPLOADS_DIR = path.join(__dirname, '../../../uploads');

function buildOffertePdfData(user: any, client: any, offerte: any, items: any[]): InvoiceData {
  return {
    invoiceNumber: offerte.offerte_number,
    invoiceDate: offerte.offerte_date,
    dueDate: offerte.valid_until || offerte.offerte_date,
    deliveryDate: offerte.offerte_date,
    paymentDays: 0,
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
    items: items.map((i: any) => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      btwRate: i.btw_rate,
      btwAmount: i.btw_amount,
      lineTotal: i.line_total,
    })),
    subtotal: offerte.subtotal,
    btwAmount: offerte.btw_amount,
    total: offerte.total,
    description: offerte.description || '',
    docTitle: 'Offerte',
  };
}

router.get('/', (req: AuthRequest, res) => {
  try {
    const offertes = queryAll(
      `SELECT o.*, c.company_name as client_name, c.email as client_email FROM offertes o LEFT JOIN clients c ON o.client_id = c.id WHERE o.user_id = ? ORDER BY o.created_at DESC`,
      [req.userId!]
    );
    res.json(offertes);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { client_id, offerte_date, valid_until, description, items } = req.body;
    const user = queryOne('SELECT * FROM users WHERE id = ?', [req.userId!]);
    const client = queryOne('SELECT * FROM clients WHERE id = ?', [client_id]);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const offerteNumber = String(user.next_offerte_number || 26001);
    run('UPDATE users SET next_offerte_number = ? WHERE id = ?', [parseInt(offerteNumber) + 1, req.userId!]);

    let subtotal = 0, btwAmount = 0, total = 0;
    const processedItems = items.map((i: any) => {
      const sub = i.quantity * i.unit_price;
      const btw = sub * (i.btw_rate / 100);
      subtotal += sub;
      btwAmount += btw;
      total += sub + btw;
      return { ...i, btw_amount: btw, line_total: sub + btw };
    });

    run(
      `INSERT INTO offertes (user_id, client_id, offerte_number, offerte_date, valid_until, description, subtotal, btw_amount, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId!, client_id, offerteNumber, offerte_date, valid_until, description, subtotal, btwAmount, total]
    );

    const offerteId = queryOne('SELECT last_insert_rowid() as id')?.id;
    for (const item of processedItems) {
      run(
        `INSERT INTO offerte_items (offerte_id, description, quantity, unit_price, btw_rate, btw_amount, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [offerteId, item.description, item.quantity, item.unit_price, item.btw_rate, item.btw_amount, item.line_total]
      );
    }

    const offerte = queryOne('SELECT * FROM offertes WHERE id = ?', [offerteId]);
    res.status(201).json({ ...offerte, items: processedItems, client });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', (req: AuthRequest, res) => {
  try {
    const offerte = queryOne('SELECT * FROM offertes WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!offerte) return res.status(404).json({ error: 'Offerte not found' });
    const items = queryAll('SELECT * FROM offerte_items WHERE offerte_id = ?', [offerte.id]);
    const client = queryOne('SELECT * FROM clients WHERE id = ?', [offerte.client_id]);
    res.json({ ...offerte, items, client });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/pdf', async (req: AuthRequest, res) => {
  try {
    const offerte = queryOne('SELECT * FROM offertes WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!offerte) return res.status(404).json({ error: 'Offerte not found' });

    const user = queryOne('SELECT * FROM users WHERE id = ?', [req.userId!]);
    const client = queryOne('SELECT * FROM clients WHERE id = ?', [offerte.client_id]);
    const items = queryAll('SELECT * FROM offerte_items WHERE offerte_id = ?', [offerte.id]);

    const pdfBuffer = await generateInvoicePDF(buildOffertePdfData(user, client, offerte, items));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${offerte.offerte_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const offerte = queryOne('SELECT * FROM offertes WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!offerte) return res.status(404).json({ error: 'Offerte not found' });
    if (offerte.converted_invoice_id) return res.status(400).json({ error: 'Cannot edit a converted offerte' });

    const { offerte_number, offerte_date, valid_until, description, items } = req.body;

    let subtotal = 0, btwAmount = 0, total = 0;
    const processedItems = (items || []).map((i: any) => {
      const q = i.quantity || 0;
      const p = i.unit_price || 0;
      const rate = i.btw_rate || 0;
      const sub = q * p;
      const btw = sub * (rate / 100);
      subtotal += sub; btwAmount += btw; total += sub + btw;
      return { ...i, btw_amount: Math.round(btw * 100) / 100, line_total: Math.round((sub + btw) * 100) / 100 };
    });
    subtotal = Math.round(subtotal * 100) / 100;
    btwAmount = Math.round(btwAmount * 100) / 100;
    total = Math.round(total * 100) / 100;

    run(
      `UPDATE offertes SET offerte_number = ?, offerte_date = ?, valid_until = ?, description = ?, subtotal = ?, btw_amount = ?, total = ? WHERE id = ?`,
      [offerte_number || offerte.offerte_number, offerte_date || offerte.offerte_date, valid_until || offerte.valid_until, description ?? offerte.description, subtotal, btwAmount, total, offerte.id]
    );

    if (Array.isArray(items)) {
      run('DELETE FROM offerte_items WHERE offerte_id = ?', [offerte.id]);
      for (const item of processedItems) {
        run(
          `INSERT INTO offerte_items (offerte_id, description, quantity, unit_price, btw_rate, btw_amount, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [offerte.id, item.description || '', item.quantity || 0, item.unit_price || 0, item.btw_rate || 0, item.btw_amount, item.line_total]
        );
      }
    }

    const updated = queryOne('SELECT * FROM offertes WHERE id = ?', [offerte.id]);
    const savedItems = queryAll('SELECT * FROM offerte_items WHERE offerte_id = ?', [offerte.id]);
    res.json({ ...updated, items: savedItems });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', (req: AuthRequest, res) => {
  try {
    const offerte = queryOne('SELECT * FROM offertes WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!offerte) return res.status(404).json({ error: 'Offerte not found' });
    if (offerte.converted_invoice_id) return res.status(400).json({ error: 'Cannot delete a converted offerte' });
    run('DELETE FROM offerte_items WHERE offerte_id = ?', [offerte.id]);
    run('DELETE FROM offertes WHERE id = ?', [offerte.id]);
    res.json({ message: 'Offerte deleted' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/convert', async (req: AuthRequest, res) => {
  try {
    const offerte = queryOne('SELECT * FROM offertes WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId!]);
    if (!offerte) return res.status(404).json({ error: 'Offerte not found' });
    if (offerte.converted_invoice_id) return res.status(400).json({ error: 'Already converted' });

    const user = queryOne('SELECT * FROM users WHERE id = ?', [req.userId!]);
    const client = queryOne('SELECT * FROM clients WHERE id = ?', [offerte.client_id]);
    const offerteItems = queryAll('SELECT * FROM offerte_items WHERE offerte_id = ?', [offerte.id]);

    // Use the canonical year-aware invoice number generator so converted
    // offertes get the next AVAILABLE invoice number (e.g. FAC2026001),
    // not the offerte's own number and not a legacy non-year format.
    const invoiceNumber = generateInvoiceNumber(req.userId!);

    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + (user.default_payment_days || 30) * 86400000).toISOString().split('T')[0];

    run(
      `INSERT INTO invoices (user_id, client_id, invoice_number, invoice_date, delivery_date, due_date, payment_terms_days, description, subtotal, btw_amount, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId!, offerte.client_id, invoiceNumber, today, today, dueDate, user.default_payment_days || 30, offerte.description, offerte.subtotal, offerte.btw_amount, offerte.total, 'draft']
    );

    const invoiceId = queryOne('SELECT last_insert_rowid() as id')?.id;
    for (const item of offerteItems) {
      run(
        `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, btw_rate, btw_amount, line_total) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, item.description, item.quantity, item.unit_price, item.btw_rate, item.btw_amount, item.line_total]
      );
    }

    run('UPDATE offertes SET converted_invoice_id = ?, status = ? WHERE id = ?', [invoiceId, 'converted', offerte.id]);

    const pdfData: InvoiceData = {
      invoiceNumber, invoiceDate: today, dueDate, deliveryDate: today, paymentDays: user.default_payment_days || 30,
      supplierName: user.company_name, supplierAddress: user.company_address, supplierPostcode: user.company_postcode, supplierCity: user.company_city,
      supplierKvk: user.kvk_number, supplierBtw: user.btw_number, supplierIban: user.iban, supplierPhone: user.phone, supplierEmail: user.email || '',
      supplierLogo: user.logo_path || undefined,
      customerName: client.company_name, customerAddress: client.address, customerPostcode: client.postcode, customerCity: client.city,
      customerCountry: client.country, customerKvk: client.kvk_number || '', customerBtw: client.btw_number || '',
      items: offerteItems.map((i: any) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unit_price, btwRate: i.btw_rate, btwAmount: i.btw_amount, lineTotal: i.line_total })),
      subtotal: offerte.subtotal, btwAmount: offerte.btw_amount, total: offerte.total, description: offerte.description || '',
    };
    const pdfBuffer = await generateInvoicePDF(pdfData);
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const pdfPath = path.join(UPLOADS_DIR, `${invoiceNumber}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);
    run('UPDATE invoices SET pdf_path = ? WHERE id = ?', [pdfPath, invoiceId]);

    const invoice = queryOne('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    res.json({ invoice, offerte: { ...offerte, status: 'converted', converted_invoice_id: invoiceId } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
