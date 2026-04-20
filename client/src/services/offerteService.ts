import api from './api';
import { downloadDocumentPdf } from './pdfDownload';

export const offerteService = {
  async getAll() {
    const res = await api.get('/offertes');
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get(`/offertes/${id}`);
    return res.data;
  },

  async create(data: { client_id: number; offerte_date: string; valid_until: string; description: string; items: any[] }) {
    const res = await api.post('/offertes', data);
    return res.data;
  },

  async update(id: number, data: any) {
    const res = await api.put(`/offertes/${id}`, data);
    return res.data;
  },

  async remove(id: number) {
    await api.delete(`/offertes/${id}`);
  },

  async convertToInvoice(id: number) {
    const res = await api.post(`/offertes/${id}/convert`);
    return res.data;
  },

  async downloadPdf(id: number, fileName: string) {
    await downloadDocumentPdf(`/offertes/${id}/pdf`, fileName);
  },
};
