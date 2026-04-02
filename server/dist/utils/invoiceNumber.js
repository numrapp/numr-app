"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceNumber = generateInvoiceNumber;
const database_1 = require("../database");
function generateInvoiceNumber(userId) {
    const user = (0, database_1.queryOne)('SELECT invoice_prefix, next_invoice_number FROM users WHERE id = ?', [userId]);
    if (!user)
        throw new Error('User not found');
    const prefix = user.invoice_prefix || 'FAC';
    const currentYear = new Date().getFullYear();
    let num = user.next_invoice_number || 1;
    const lastInvoice = (0, database_1.queryOne)('SELECT invoice_number FROM invoices WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
    if (lastInvoice && lastInvoice.invoice_number) {
        const match = lastInvoice.invoice_number.match(/(\d{4})\d{3}$/);
        if (match) {
            const lastYear = parseInt(match[1]);
            if (lastYear < currentYear) {
                num = 1;
                (0, database_1.run)('UPDATE users SET next_invoice_number = ? WHERE id = ?', [2, userId]);
                return `${prefix}${currentYear}${String(num).padStart(3, '0')}`;
            }
        }
    }
    (0, database_1.run)('UPDATE users SET next_invoice_number = ? WHERE id = ?', [num + 1, userId]);
    return `${prefix}${currentYear}${String(num).padStart(3, '0')}`;
}
//# sourceMappingURL=invoiceNumber.js.map