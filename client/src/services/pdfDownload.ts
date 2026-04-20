import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import api from './api';

/**
 * Fetches a PDF from the backend as a base64 string (native) or Blob (web).
 * Native uses axios -> arraybuffer -> base64 to avoid fetch/origin quirks on capacitor://.
 */
async function fetchPdfAsBase64(path: string): Promise<string> {
  const res = await api.get(path, { responseType: 'arraybuffer' });
  const bytes = new Uint8Array(res.data as ArrayBuffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

async function fetchPdfAsBlob(path: string): Promise<Blob> {
  const res = await api.get(path, { responseType: 'blob' });
  return res.data as Blob;
}

function sanitiseFileName(name: string): string {
  const base = name.replace(/\.pdf$/i, '');
  const clean = base.replace(/[^a-zA-Z0-9_\-. ]/g, '_').trim() || 'document';
  return `${clean}.pdf`;
}

/**
 * Save a PDF into the user's Files app (native) or trigger a browser download (web).
 * On native, after writing we also open the iOS share sheet so the user can
 * pick "Save to Files", send to WhatsApp, Mail, etc.
 */
export async function downloadDocumentPdf(path: string, fileName: string): Promise<void> {
  const safe = sanitiseFileName(fileName);

  if (Capacitor.isNativePlatform()) {
    const base64 = await fetchPdfAsBase64(path);
    const write = await Filesystem.writeFile({
      path: safe,
      data: base64,
      directory: Directory.Documents,
      recursive: true,
    });
    await Share.share({
      title: safe,
      text: safe,
      url: write.uri,
      dialogTitle: safe,
    });
    return;
  }

  const blob = await fetchPdfAsBlob(path);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safe;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Downloads the PDF to a cache/documents location and returns the local URI
 * plus the base64 payload. Used by WhatsApp / Mail share flows so we can
 * attach the actual PDF instead of sending a link.
 */
export async function preparePdfForShare(
  path: string,
  fileName: string,
): Promise<{ uri: string; base64: string; fileName: string }> {
  const safe = sanitiseFileName(fileName);
  const base64 = await fetchPdfAsBase64(path);
  const write = await Filesystem.writeFile({
    path: safe,
    data: base64,
    directory: Directory.Cache,
    recursive: true,
  });
  return { uri: write.uri, base64, fileName: safe };
}

/**
 * Share a PDF via the native share sheet with a custom message body.
 * Suitable for WhatsApp, Mail, Messages, etc. The user picks the target app.
 */
export async function sharePdfNative(options: {
  path: string;
  fileName: string;
  title: string;
  text: string;
  dialogTitle?: string;
}): Promise<void> {
  const prepared = await preparePdfForShare(options.path, options.fileName);
  await Share.share({
    title: options.title,
    text: options.text,
    url: prepared.uri,
    dialogTitle: options.dialogTitle || options.title,
  });
}

/**
 * Open the default mail composer with a PDF attachment via the share sheet.
 * Because iOS does not let web-embedded apps attach files via `mailto:`,
 * we route through the share sheet; the user simply taps "Mail".
 */
export async function sendPdfByMail(options: {
  path: string;
  fileName: string;
  to?: string;
  subject: string;
  body: string;
}): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await sharePdfNative({
      path: options.path,
      fileName: options.fileName,
      title: options.subject,
      text: options.body,
      dialogTitle: options.subject,
    });
    return;
  }
  // Web fallback: trigger download + open mailto (no attachment possible in browsers).
  await downloadDocumentPdf(options.path, options.fileName);
  const params = new URLSearchParams();
  params.set('subject', options.subject);
  params.set('body', options.body);
  const to = options.to ? encodeURIComponent(options.to) : '';
  window.location.href = `mailto:${to}?${params.toString()}`;
}

/**
 * Share a PDF specifically via WhatsApp. On native we use the share sheet
 * (user taps WhatsApp). On web we fall back to wa.me with plain text since
 * browsers can't attach files to WhatsApp Web.
 */
export async function sharePdfViaWhatsApp(options: {
  path: string;
  fileName: string;
  phone?: string;
  text: string;
}): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await sharePdfNative({
      path: options.path,
      fileName: options.fileName,
      title: options.fileName,
      text: options.text,
      dialogTitle: 'WhatsApp',
    });
    return;
  }
  await downloadDocumentPdf(options.path, options.fileName);
  const phone = (options.phone || '').replace(/\D/g, '');
  const encoded = encodeURIComponent(options.text);
  const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}
