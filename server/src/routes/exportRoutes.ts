import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { queryAll, queryOne } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { generateInvoicePDF, InvoiceData } from '../services/pdfService';

const router = Router();
router.use(authMiddleware);

router.get('/invoices', async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;

    let sql = `SELECT i.*, c.company_name as client_name FROM invoices i
               LEFT JOIN clients c ON i.client_id = c.id
               WHERE i.user_id = ?`;
    const params: any[] = [req.userId!];

    if (start_date) {
      sql += ' AND i.invoice_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND i.invoice_date <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY i.invoice_date DESC';
    const invoices = queryAll(sql, params);

    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/download-zip', async (req: AuthRequest, res) => {
  try {
    const { start_date, end_date } = req.query;

    let sql = 'SELECT * FROM invoices WHERE user_id = ?';
    const params: any[] = [req.userId!];

    if (start_date) {
      sql += ' AND invoice_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND invoice_date <= ?';
      params.push(end_date);
    }

    const invoices = queryAll(sql, params);
    const user = queryOne('SELECT * FROM users WHERE id = ?', [req.userId!]);

    if (invoices.length === 0) {
      return res.status(404).json({ error: 'No invoices found for the selected period' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="facturen_${start_date || 'all'}_${end_date || 'all'}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const invoice of invoices) {
      if (invoice.pdf_path && fs.existsSync(invoice.pdf_path)) {
        archive.file(invoice.pdf_path, { name: `${invoice.invoice_number}.pdf` });
      } else {
        const client = queryOne('SELECT * FROM clients WHERE id = ?', [invoice.client_id]);
        const items = queryAll('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoice.id]);
        const pdfData: InvoiceData = {
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
          customerName: client?.company_name || '',
          customerAddress: client?.address || '',
          customerPostcode: client?.postcode || '',
          customerCity: client?.city || '',
          customerCountry: client?.country || '',
          customerKvk: client?.kvk_number || '',
          customerBtw: client?.btw_number || '',
          items: items.map((i: any) => ({
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
        const pdfBuffer = await generateInvoicePDF(pdfData);
        archive.append(pdfBuffer, { name: `${invoice.invoice_number}.pdf` });
      }
    }

    let csv = 'Factuurnummer;Factuurdatum;Klant;Subtotaal;BTW;Totaal;Status\n';
    for (const inv of invoices) {
      const client = queryOne('SELECT company_name FROM clients WHERE id = ?', [inv.client_id]);
      csv += `${inv.invoice_number};${inv.invoice_date};${client?.company_name || ''};${inv.subtotal};${inv.btw_amount};${inv.total};${inv.status}\n`;
    }
    archive.append(csv, { name: 'overzicht.csv' });

    await archive.finalize();
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
