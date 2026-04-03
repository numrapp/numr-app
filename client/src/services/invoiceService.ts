import api from './api';
import { Invoice, InvoiceItem } from '../types';

export const invoiceService = {
  async getAll() {
    const res = await api.get<Invoice[]>('/invoices');
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<Invoice>(`/invoices/${id}`);
    return res.data;
  },

  async create(data: { client_id: number; invoice_date: string; delivery_date: string; due_date: string; payment_terms_days: number; description: string; items: InvoiceItem[] }) {
    const res = await api.post<Invoice>('/invoices', data);
    return res.data;
  },

  async send(id: number) {
    const res = await api.post<{ message: string }>(`/invoices/${id}/send`);
    return res.data;
  },

  async downloadPdf(id: number) {
    const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const isMobileSafari = /iPhone|iPad/.test(navigator.userAgent);
    if (isMobileSafari) {
      window.open(url, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = `factuur_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  },

  async updateStatus(id: number, status: string) {
    const res = await api.patch<Invoice>(`/invoices/${id}/status`, { status });
    return res.data;
  },

  async remove(id: number) {
    await api.delete(`/invoices/${id}`);
  },

  async downloadZip(startDate: string, endDate: string) {
    const res = await api.get('/export/download-zip', {
      params: { start_date: startDate, end_date: endDate },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `facturen_${startDate}_${endDate}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  async getExportInvoices(startDate: string, endDate: string) {
    const res = await api.get<Invoice[]>('/export/invoices', {
      params: { start_date: startDate, end_date: endDate },
    });
    return res.data;
  },
};
