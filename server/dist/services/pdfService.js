"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePDF = generateInvoicePDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function eur(n) { return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n); }
function dt(s) { return new Date(s).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
function generateInvoicePDF(data) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ size: 'A4', margins: { top: 40, bottom: 40, left: 50, right: 50 } });
        const chunks = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        const L = 50, R = 545, W = R - L;
        const dk = '#000000', md = '#444444', bk = '#000000';
        let y = 30;
        const title = data.docTitle || 'FACTUUR';
        doc.rect(L - 2, y - 2, W + 4, 760).stroke(bk);
        const logoPath = data.supplierLogo ? path_1.default.resolve(data.supplierLogo.startsWith('/') ? data.supplierLogo : path_1.default.join(__dirname, '../../../', data.supplierLogo)) : null;
        if (logoPath && fs_1.default.existsSync(logoPath)) {
            try {
                doc.image(logoPath, L + 10, y + 8, { height: 36 });
            }
            catch {
                doc.font('Helvetica-Bold').fontSize(18).fillColor('#1e40af').text(title, L + 10, y + 12);
            }
        }
        else {
            doc.font('Helvetica-Bold').fontSize(18).fillColor('#1e40af').text(title, L + 10, y + 12);
        }
        const rx = 340, vx = 400;
        doc.font('Helvetica').fontSize(8.5).fillColor(md);
        doc.text(data.supplierName, vx, y + 8, { width: 140, align: 'right' });
        doc.text(data.supplierAddress, vx, y + 19, { width: 140, align: 'right' });
        doc.text(`${data.supplierPostcode} ${data.supplierCity}`, vx, y + 30, { width: 140, align: 'right' });
        let cy = y + 41;
        if (data.supplierKvk) {
            doc.text(`KVK: ${data.supplierKvk}`, vx, cy, { width: 140, align: 'right' });
            cy += 11;
        }
        if (data.supplierBtw) {
            doc.text(`BTW: ${data.supplierBtw}`, vx, cy, { width: 140, align: 'right' });
            cy += 11;
        }
        if (data.supplierPhone) {
            doc.text(`Tel: ${data.supplierPhone}`, vx, cy, { width: 140, align: 'right' });
        }
        y += 60;
        doc.moveTo(L, y).lineTo(R, y).lineWidth(0.5).strokeColor(bk).stroke();
        y += 10;
        const leftX = L + 10;
        const label = title === 'OFFERTE' ? 'Offerte aan' : 'Factuur aan';
        doc.font('Helvetica-Bold').fontSize(7).fillColor('#9ca3af').text(label.toUpperCase(), leftX, y);
        y += 12;
        doc.font('Helvetica-Bold').fontSize(9).fillColor(dk).text(data.customerName || '-', leftX, y);
        y += 12;
        doc.font('Helvetica').fontSize(8.5).fillColor(md);
        if (data.customerAddress) {
            doc.text(data.customerAddress, leftX, y);
            y += 11;
        }
        const custLoc = `${data.customerPostcode} ${data.customerCity}`.trim();
        if (custLoc) {
            doc.text(custLoc, leftX, y);
            y += 11;
        }
        const numLabel = title === 'OFFERTE' ? 'Offertenummer' : 'Factuurnummer';
        const dateLabel = title === 'OFFERTE' ? 'Offertedatum' : 'Factuurdatum';
        const infoX = 370, valX = 450;
        let infoY = y - 34;
        doc.font('Helvetica').fontSize(8).fillColor('#9ca3af');
        doc.text(numLabel + ':', infoX, infoY);
        doc.font('Helvetica-Bold').fontSize(8).fillColor(md).text(data.invoiceNumber, valX, infoY);
        infoY += 12;
        doc.font('Helvetica').fillColor('#9ca3af').text(dateLabel + ':', infoX, infoY);
        doc.font('Helvetica-Bold').fillColor(md).text(dt(data.invoiceDate), valX, infoY);
        infoY += 12;
        if (data.dueDate) {
            doc.font('Helvetica').fillColor('#9ca3af').text('Vervaldatum:', infoX, infoY);
            doc.font('Helvetica-Bold').fillColor(md).text(dt(data.dueDate), valX, infoY);
            infoY += 12;
        }
        if (data.deliveryDate) {
            doc.font('Helvetica').fillColor('#9ca3af').text('Leveringsdatum:', infoX, infoY);
            doc.font('Helvetica-Bold').fillColor(md).text(dt(data.deliveryDate), valX, infoY);
        }
        if (data.description) {
            y += 5;
            doc.font('Helvetica').fontSize(8).fillColor('#9ca3af').text('Opmerking: ', leftX, y, { continued: true });
            doc.fillColor(md).text(data.description);
            y += 14;
        }
        y = Math.max(y + 10, 220);
        doc.moveTo(L + 5, y).lineTo(R - 5, y).lineWidth(1).strokeColor(bk).stroke();
        y += 4;
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#6b7280');
        doc.text('Omschrijving', leftX, y);
        doc.text('Aantal', 370, y, { width: 45, align: 'right' });
        doc.text('Prijs', 420, y, { width: 50, align: 'right' });
        doc.text('BTW', 472, y, { width: 30, align: 'right' });
        doc.text('Bedrag', 505, y, { width: R - 510, align: 'right' });
        y += 14;
        doc.moveTo(L + 5, y).lineTo(R - 5, y).lineWidth(1).strokeColor(bk).stroke();
        y += 6;
        doc.font('Helvetica').fontSize(8.5).fillColor(dk);
        data.items.forEach(item => {
            doc.text(item.description || '-', leftX, y, { width: 290 });
            doc.text(item.quantity.toFixed(2).replace('.', ','), 370, y, { width: 45, align: 'right' });
            doc.text(eur(item.unitPrice).replace('\u20AC ', ''), 420, y, { width: 50, align: 'right' });
            doc.text(`${item.btwRate}%`, 472, y, { width: 30, align: 'right' });
            doc.text(eur(item.lineTotal).replace('\u20AC ', ''), 505, y, { width: R - 510, align: 'right' });
            y += 15;
            doc.moveTo(L + 5, y - 2).lineTo(R - 5, y - 2).lineWidth(0.3).strokeColor('#d1d5db').stroke();
        });
        y += 10;
        const totX = 400, totVX = 480;
        doc.font('Helvetica').fontSize(8.5).fillColor('#6b7280');
        doc.text('Subtotaal:', totX, y);
        doc.fillColor(dk).text(eur(data.subtotal), totVX, y, { width: R - totVX - 10, align: 'right' });
        y += 13;
        doc.fillColor('#6b7280').text('BTW:', totX, y);
        doc.fillColor(dk).text(eur(data.btwAmount), totVX, y, { width: R - totVX - 10, align: 'right' });
        y += 13;
        doc.moveTo(totX, y).lineTo(R - 10, y).lineWidth(1).strokeColor(bk).stroke();
        y += 5;
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#1e40af');
        doc.text('Totaal:', totX, y);
        doc.text(eur(data.total), totVX, y, { width: R - totVX - 10, align: 'right' });
        const payY = 680;
        doc.moveTo(L + 5, payY).lineTo(R - 5, payY).lineWidth(0.5).strokeColor(bk).stroke();
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#1e40af').text('Betaalgegevens', leftX, payY + 6);
        doc.font('Helvetica').fontSize(8).fillColor(md);
        doc.text(`IBAN: ${data.supplierIban}   t.n.v. ${data.supplierName}`, leftX, payY + 18);
        doc.text(`Betalingstermijn: ${data.paymentDays} dagen`, leftX, payY + 30);
        const footY = 720;
        doc.font('Helvetica').fontSize(7).fillColor('#9ca3af');
        doc.text(`${data.supplierName} | KVK: ${data.supplierKvk} | BTW: ${data.supplierBtw}`, L, footY, { width: W, align: 'center' });
        const bannerY = 758;
        doc.rect(L - 2, bannerY, W + 4, 30).fill('#DFFF00');
        const p1 = title === 'OFFERTE' ? 'Deze offerte is gemaakt met ' : 'Deze factuur is gemaakt met ';
        doc.font('Helvetica').fontSize(9);
        const p1w = doc.widthOfString(p1);
        doc.font('Helvetica-Bold').fontSize(11);
        const p2w = doc.widthOfString('numr');
        const fx = L + (W - p1w - p2w) / 2;
        const fy = bannerY + 9;
        doc.font('Helvetica').fontSize(9).fillColor(dk).text(p1, fx, fy, { lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(11).fillColor(dk).text('numr', fx + p1w, fy - 1, { lineBreak: false });
        doc.end();
    });
}
//# sourceMappingURL=pdfService.js.map