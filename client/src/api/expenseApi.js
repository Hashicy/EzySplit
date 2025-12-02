import axios from 'axios';

const raw = import.meta.env.VITE_API_URL || '';
const base = (raw ? raw.replace(/\/+$/,'').replace(/\/api$/,'') : '')
const api = axios.create({
  baseURL: base,
  withCredentials: true
});

export const createExpense = (data) => api.post('/api/expenses', data).then(r => r.data);
export const getExpenses = (params) => api.get('/api/expenses', { params }).then(r => r.data);
export const getExpense = (id) => api.get(`/api/expenses/${id}`).then(r => r.data);
export const updateExpense = (id, data) => api.put(`/api/expenses/${id}`, data).then(r => r.data);
export const deleteExpense = (id) => api.delete(`/api/expenses/${id}`).then(r => r.data);
export const getSummarySplit = () => api.get('/api/expenses/summary/all/split').then(r => r.data);

export default api;
