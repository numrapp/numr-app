import api from './api';
import { User, RegisterData } from '../types';

export const authService = {
  async register(data: RegisterData) {
    const res = await api.post<{ token: string; userId: number }>('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await api.post<{ token: string; userId: number }>('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    return res.data;
  },

  async getProfile() {
    const res = await api.get<User>('/auth/profile');
    return res.data;
  },

  async updateProfile(data: Partial<User>) {
    const res = await api.put<User>('/auth/profile', data);
    return res.data;
  },

  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await api.post<{ logo_path: string }>('/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};
