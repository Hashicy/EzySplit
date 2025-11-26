import axios from 'axios';

const base = import.meta.env.VITE_API_URL?.replace(/\/+$/,'') || 'http://localhost:4000';
const api = axios.create({
  // Ensure we point to the API root (server expects /api/...)
  baseURL: base.endsWith('/api') ? base : `${base}/api`,
  withCredentials: true
});

export const signup = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const me = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};