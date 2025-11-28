import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL?.replace(/\/+$/,'') || 'http://localhost:4000', withCredentials: true });

const base = api.defaults.baseURL?.endsWith('/api') ? api.defaults.baseURL : (api.defaults.baseURL ? `${api.defaults.baseURL}/api` : '/api');

const a = axios.create({ baseURL: base, withCredentials: true });

export const searchUsers = (q) => a.get('/users/search', { params: { q } }).then(r => r.data);
export const followUser = (id) => a.post(`/users/${id}/follow`).then(r => r.data);
export const unfollowUser = (id) => a.post(`/users/${id}/unfollow`).then(r => r.data);
export const getUser = (id) => a.get(`/users/${id}`).then(r => r.data);
export const getMe = () => a.get('/users/me').then(r => r.data);
export const updateMe = (payload) => a.put('/users/me', payload).then(r => r.data);

export default a;
