"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInvoiceEmail = sendInvoiceEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
async function sendInvoiceEmail(params) {
    const { config, to, supplierName, customerName, invoiceNumber, total, pdfBuffer } = params;
    const transporter = nodemailer_1.default.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">Factuur ${invoiceNumber}</h2>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Geachte ${customerName},</p>
        <p>Hierbij ontvangt u factuur <strong>${invoiceNumber}</strong> ter hoogte van <strong>${total}</strong>.</p>
        <p>De factuur vindt u als bijlage bij deze e-mail.</p>
        <br/>
        <p>Met vriendelijke groet,</p>
        <p><strong>${supplierName}</strong></p>
      </div>
    </div>
  `;
    await transporter.sendMail({
        from: `"${supplierName}" <${config.user}>`,
        to,
        subject: `Factuur ${invoiceNumber} - ${supplierName}`,
        html,
        attachments: [
            {
                filename: `${invoiceNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ],
    });
}
//# sourceMappingURL=emailService.js.map