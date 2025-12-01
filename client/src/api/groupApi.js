import client from './expenseApi';

export const createGroup = (data) => {
	try {
		const url = (client.defaults.baseURL || '') + '/api/groups';
		console.debug('groupApi.createGroup -> POST', url, 'payload:', data);
	} catch (e) { /* ignore */ }
	return client.post('/api/groups', data).then(r => r.data);
};
export const getGroup = (id) => client.get(`/api/groups/${id}`).then(r => r.data);
export const getGroupExpenses = (id, params) => client.get(`/api/groups/${id}/expenses`, { params }).then(r => r.data);
export const updateMembers = (id, data) => client.put(`/api/groups/${id}/members`, data).then(r => r.data);
export const deleteGroup = (id) => client.delete(`/api/groups/${id}`).then(r => r.data);
export const listMyGroups = () => client.get('/api/groups').then(r => r.data).catch(()=>({groups:[]}));

export default client;
