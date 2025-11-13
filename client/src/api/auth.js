import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ezysplit.onrender.com/',
  withCredentials: true
});

export const signup = async (name, email, password) => {
  const { data } = await api.post('/api/auth/register', { name, email, password });
  return data;
};

export const login = async (email, password) => {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
};

export const me = async () => {
  const { data } = await api.get('/api/auth/me');
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/api/auth/logout');
  return data;
};