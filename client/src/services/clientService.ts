import api from './api';
import { Client } from '../types';

export const clientService = {
  async getAll() {
    const res = await api.get<Client[]>('/clients');
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<Client>(`/clients/${id}`);
    return res.data;
  },

  async create(data: Partial<Client>) {
    const res = await api.post<Client>('/clients', data);
    return res.data;
  },

  async update(id: number, data: Partial<Client>) {
    const res = await api.put<Client>(`/clients/${id}`, data);
    return res.data;
  },

  async remove(id: number) {
    await api.delete(`/clients/${id}`);
  },

  async lookupKvk(nummer: string) {
    const res = await api.get<{ company_name: string; address: string; postcode: string; city: string }>(`/kvk/${nummer}`);
    return res.data;
  },
};
