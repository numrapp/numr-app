"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
const database_1 = require("../database");
const auth_1 = require("../middleware/auth");
const pdfService_1 = require("../services/pdfService");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/invoices', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let sql = `SELECT i.*, c.company_name as client_name FROM invoices i
               LEFT JOIN clients c ON i.client_id = c.id
               WHERE i.user_id = ?`;
        const params = [req.userId];
        if (start_date) {
            sql += ' AND i.invoice_date >= ?';
            params.push(start_date);
        }
        if (end_date) {
            sql += ' AND i.invoice_date <= ?';
            params.push(end_date);
        }
        sql += ' ORDER BY i.invoice_date DESC';
        const invoices = (0, database_1.queryAll)(sql, params);
        res.json(invoices);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/download-zip', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let sql = 'SELECT * FROM invoices WHERE user_id = ?';
        const params = [req.userId];
        if (start_date) {
            sql += ' AND invoice_date >= ?';
            params.push(start_date);
        }
        if (end_date) {
            sql += ' AND invoice_date <= ?';
            params.push(end_date);
        }
        const invoices = (0, database_1.queryAll)(sql, params);
        const user = (0, database_1.queryOne)('SELECT * FROM users WHERE id = ?', [req.userId]);
        if (invoices.length === 0) {
            return res.status(404).json({ error: 'No invoices found for the selected period' });
        }
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="facturen_${start_date || 'all'}_${end_date || 'all'}.zip"`);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        archive.pipe(res);
        for (const invoice of invoices) {
            if (invoice.pdf_path && fs_1.default.existsSync(invoice.pdf_path)) {
                archive.file(invoice.pdf_path, { name: `${invoice.invoice_number}.pdf` });
            }
            else {
                const client = (0, database_1.queryOne)('SELECT * FROM clients WHERE id = ?', [invoice.client_id]);
                const items = (0, database_1.queryAll)('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoice.id]);
                const pdfData = {
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
                    items: items.map((i) => ({
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
                const pdfBuffer = await (0, pdfService_1.generateInvoicePDF)(pdfData);
                archive.append(pdfBuffer, { name: `${invoice.invoice_number}.pdf` });
            }
        }
        let csv = 'Factuurnummer;Factuurdatum;Klant;Subtotaal;BTW;Totaal;Status\n';
        for (const inv of invoices) {
            const client = (0, database_1.queryOne)('SELECT company_name FROM clients WHERE id = ?', [inv.client_id]);
            csv += `${inv.invoice_number};${inv.invoice_date};${client?.company_name || ''};${inv.subtotal};${inv.btw_amount};${inv.total};${inv.status}\n`;
        }
        archive.append(csv, { name: 'overzicht.csv' });
        await archive.finalize();
    }
    catch (err) {
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    }
});
exports.default = router;
//# sourceMappingURL=exportRoutes.js.map