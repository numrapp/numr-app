import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

interface SendInvoiceEmailParams {
  config: EmailConfig;
  to: string;
  supplierName: string;
  customerName: string;
  invoiceNumber: string;
  total: string;
  pdfBuffer: Buffer;
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<void> {
  const { config, to, supplierName, customerName, invoiceNumber, total, pdfBuffer } = params;

  const transporter = nodemailer.createTransport({
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
