import axios from 'axios';

const base = import.meta.env.VITE_API_URL?.replace(/\/+$/,'') || 'http://localhost:4000';
const api = axios.create({
  baseURL: base.endsWith('/api') ? base : `${base}/api`,
  withCredentials: true
});

export const signup = async (name, email, password, username) => {
  const { data } = await api.post('/auth/register', { name, email, password, username });
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/auth/me', payload);
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