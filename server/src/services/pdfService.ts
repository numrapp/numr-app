import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface InvoiceData {
  invoiceNumber: string; invoiceDate: string; dueDate: string; deliveryDate: string; paymentDays: number;
  supplierName: string; supplierAddress: string; supplierPostcode: string; supplierCity: string;
  supplierKvk: string; supplierBtw: string; supplierIban: string; supplierPhone: string; supplierEmail: string;
  supplierLogo?: string;
  customerName: string; customerAddress: string; customerPostcode: string; customerCity: string;
  customerCountry: string; customerKvk: string; customerBtw: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; btwRate: number; btwAmount: number; lineTotal: number; }>;
  subtotal: number; btwAmount: number; total: number; description: string;
  docTitle?: string;
}

function eur(n: number) { return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n); }
function dt(s: string) { return new Date(s).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' }); }

export function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 55, right: 55 } });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const L = 55, R = 540, W = R - L;
    const dk = '#000000', md = '#444444', border = '#000000';
    const rx = 340, vx = 400;
    let y = 40;
    const title = data.docTitle || 'Factuur';

    const logoPath = data.supplierLogo ? path.resolve(data.supplierLogo.startsWith('/') ? data.supplierLogo : path.join(__dirname, '../../../', data.supplierLogo)) : null;
    if (logoPath && fs.existsSync(logoPath)) {
      try { doc.image(logoPath, L, y, { height: 40 }); } catch { doc.font('Helvetica-Bold').fontSize(22).fillColor(dk).text(data.supplierName, L, y); }
    } else {
      doc.font('Helvetica-Bold').fontSize(22).fillColor(dk).text(data.supplierName, L, y);
    }

    doc.font('Helvetica').fontSize(9).fillColor(md);
    doc.text(data.supplierAddress, vx, y);
    doc.text(`${data.supplierPostcode} ${data.supplierCity}`, vx, y + 13);
    let contactY = y + 26;
    if (data.supplierPhone) {
      doc.font('Helvetica-Bold').fontSize(9).fillColor(dk).text('telefoon', rx, contactY);
      doc.font('Helvetica').fontSize(9).fillColor(md).text(data.supplierPhone, vx, contactY);
      contactY += 13;
    }
    doc.font('Helvetica-Bold').fontSize(9).fillColor(dk).text('e-mail', rx, contactY);
    doc.font('Helvetica').fontSize(9).fillColor(md).text(data.supplierEmail || '', vx, contactY);

    y += 48;

    doc.font('Helvetica-Bold').fontSize(16).fillColor(dk).text(title, L, y);
    y += 26;

    doc.font('Helvetica-Bold').fontSize(10).fillColor(dk).text(data.customerName, L, y);
    y += 13;
    doc.font('Helvetica').fontSize(9).fillColor(md);
    if (data.customerAddress) { doc.text(data.customerAddress, L, y); y += 11; }
    const custLoc = `${data.customerPostcode} ${data.customerCity}`.trim();
    if (custLoc) { doc.text(custLoc, L, y); y += 11; }

    let ry = 100;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(dk);
    doc.text('IBAN', rx, ry); doc.font('Helvetica').text(data.supplierIban, vx, ry); ry += 13;
    doc.font('Helvetica-Bold').text('Btw-nr', rx, ry); doc.font('Helvetica').text(data.supplierBtw, vx, ry); ry += 13;
    doc.font('Helvetica-Bold').text('KvK', rx, ry); doc.font('Helvetica').text(data.supplierKvk, vx, ry);

    y = Math.max(y + 8, ry + 20, 160);

    doc.rect(L, y, 235, 82).fillAndStroke('#f9f9f9', border);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(dk).text('Betaalgegevens', L + 5, y + 4);
    doc.font('Helvetica').fontSize(9).fillColor(md);
    doc.text('Te betalen', L + 5, y + 18); doc.font('Helvetica-Bold').fillColor(dk).text(eur(data.total), L + 85, y + 18);
    doc.font('Helvetica').fillColor(md).text('Naar IBAN', L + 5, y + 31); doc.font('Helvetica-Bold').fillColor(dk).text(data.supplierIban, L + 85, y + 31);
    doc.font('Helvetica').fillColor(md).text('Op naam van', L + 5, y + 44); doc.font('Helvetica-Bold').fillColor(dk).text(data.supplierName, L + 85, y + 44);
    doc.font('Helvetica').fillColor(md).text('Betalingstermijn', L + 5, y + 57); doc.font('Helvetica-Bold').fillColor(dk).text(`${data.paymentDays} dagen`, L + 85, y + 57);

    doc.font('Helvetica').fontSize(9).fillColor(md);
    const numLabel = title === 'Offerte' ? 'Offertenummer' : 'Factuurnummer';
    const dateLabel = title === 'Offerte' ? 'Offertedatum' : 'Factuurdatum';
    doc.text(numLabel, rx, y + 18); doc.font('Helvetica-Bold').fillColor(dk).text(data.invoiceNumber, rx + 90, y + 18);
    doc.font('Helvetica').fillColor(md).text(dateLabel, rx, y + 33); doc.font('Helvetica-Bold').fillColor(dk).text(dt(data.invoiceDate), rx + 90, y + 33);

    y += 100;

    doc.rect(L, y, W, 18).fillAndStroke('#f0f0f0', border);
    doc.font('Helvetica-Bold').fontSize(9).fillColor(dk);
    doc.text('Omschrijving', L + 5, y + 4);
    doc.text('Aantal', 370, y + 4, { width: 50, align: 'right' });
    doc.text('Prijs', 425, y + 4, { width: 55, align: 'right' });
    doc.text('Totaal', 485, y + 4, { width: R - 485, align: 'right' });
    y += 28;

    doc.font('Helvetica').fontSize(9).fillColor(dk);
    data.items.forEach(item => {
      doc.text(item.description, L + 5, y, { width: 305 });
      doc.text(item.quantity.toFixed(2).replace('.', ','), 370, y, { width: 50, align: 'right' });
      doc.text(eur(item.unitPrice).replace('\u20AC ', ''), 425, y, { width: 55, align: 'right' });
      doc.text(eur(item.lineTotal).replace('\u20AC ', ''), 485, y, { width: R - 485, align: 'right' });
      y += 14;
    });

    const footerY = 735;
    doc.rect(L, footerY, W, 24).fillAndStroke('#f0f0f0', border);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(dk);
    const btwText = data.items[0]?.btwRate === 0
      ? `Btw verlegd naar u. Uw btw-nummer is ${data.customerBtw || data.supplierBtw}.`
      : `BTW ${data.items[0]?.btwRate || 21}%: ${eur(data.btwAmount)}`;
    doc.text(btwText, L + 5, footerY + 7);
    const totalLabel = title === 'Offerte' ? 'Offertebedrag' : 'Factuurbedrag';
    doc.text(totalLabel, 390, footerY + 4);
    doc.fontSize(9).text('\u20AC', 460, footerY + 4);
    doc.text(eur(data.total).replace('\u20AC ', ''), 472, footerY + 4, { width: R - 477, align: 'right' });

    const bannerY = 770;
    doc.rect(0, bannerY, 595, 30).fill('#DFFF00');
    const p1 = title === 'Offerte' ? 'Deze offerte is gemaakt met ' : 'Deze factuur is gemaakt met ';
    doc.font('Helvetica').fontSize(10);
    const p1w = doc.widthOfString(p1);
    doc.font('Helvetica-Bold').fontSize(12);
    const p2w = doc.widthOfString('numr');
    const fx = (595 - p1w - p2w) / 2;
    const fy = bannerY + 10;
    doc.font('Helvetica').fontSize(10).fillColor('#000000').text(p1, fx, fy, { lineBreak: false });
    const sx = fx + p1w;
    const sy = fy - 1;
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#ffffff').text('numr', sx + 0.6, sy + 0.6, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000').text('numr', sx, sy, { lineBreak: false });

    doc.end();
  });
}
