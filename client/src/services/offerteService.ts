import api from './api';

export const offerteService = {
  async getAll() {
    const res = await api.get('/offertes');
    return res.data;
  },

  async create(data: { client_id: number; offerte_date: string; valid_until: string; description: string; items: any[] }) {
    const res = await api.post('/offertes', data);
    return res.data;
  },

  async convertToInvoice(id: number) {
    const res = await api.post(`/offertes/${id}/convert`);
    return res.data;
  },
};
