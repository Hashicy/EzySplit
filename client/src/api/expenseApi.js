import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: true
});

export const createExpense = (data) => api.post('/api/expenses', data).then(r => r.data);
export const getExpenses = (params) => api.get('/api/expenses', { params }).then(r => r.data);
export const getExpense = (id) => api.get(`/api/expenses/${id}`).then(r => r.data);
export const updateExpense = (id, data) => api.put(`/api/expenses/${id}`, data).then(r => r.data);
export const deleteExpense = (id) => api.delete(`/api/expenses/${id}`).then(r => r.data);

export default api;
