import axios from 'axios';

const base = import.meta.env.VITE_API_URL?.replace(/\/+$/,'') ;
const api = axios.create({
  baseURL: base.endsWith('/api') ? base : `${base}/api`,
  withCredentials: true
});

export const signup = async (name, email, password, username) => {
  try {
    const payload = { name, email, password, username };
    console.debug('auth.signup -> POST', (api.defaults.baseURL || '') + '/auth/register', 'payload:', payload);
  } catch (e) { /* ignore */ }
  const { data } = await api.post('/auth/register', { name, email, password, username });
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put('/auth/me', payload);
  return data;
};

export const login = async (email, password) => {
  try {
    const payload = { email, password };
    console.debug('auth.login -> POST', (api.defaults.baseURL || '') + '/auth/login', 'payload:', payload);
  } catch (e) { /* ignore */ }
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