import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { searchUsers, followUser, unfollowUser, getMe } from '../api/users.js';
export default function UserSearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loadingMap, setLoadingMap] = useState({});
  const [searching, setSearching] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const onSearch = async () => {
    setError('');
    setSearching(true);
    try {
      const res = await searchUsers(q);
      let users = res.users || [];
      if (user) {
        try {
          const meRes = await getMe();
          const followingSet = new Set((meRes.user?.following || []).map(id => String(id)));
          users = users.map(u => ({ ...u, following: followingSet.has(String(u._id)) }));
        } catch (e) {
          console.error('getMe failed', e);
        }
      }
      setResults(users);
    } catch (err) {
      console.error('searchUsers error', err);
      setError(err?.response?.data?.error || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  // do not auto-load users on mount; show results only after a search

  const toggleFollow = async (id, following) => {
    if (!user) {
      // redirect to login without browser confirm dialog
      navigate('/login', { state: { flash: 'Please login to follow users' } });
      return;
    }
    setLoadingMap(m => ({ ...m, [id]: true }));
    try {
  if (following) await unfollowUser(id);
  else await followUser(id);
      setResults(results.map(r => r._id === id ? { ...r, following: !following } : r));
    } catch (err) {
      console.error(err);
      if (err?.response?.status === 401) {
        // auth problem on server: redirect to login
        navigate('/login', { state: { flash: 'Please login to follow users' } });
        return;
      }
      alert(err?.response?.data?.error || 'Failed to update follow');
    } finally {
      setLoadingMap(m => { const c = { ...m }; delete c[id]; return c; });
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '20px auto' }}>
      <h2>Find users</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, username or email" style={{ flex: 1, padding: 10 }} />
        <button onClick={onSearch} className="btn-primary" disabled={searching}>{searching ? 'Searching…' : 'Search'}</button>
      </div>
      {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {results.map(r => (
          <li key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{r.name || r.username || r.email}</div>
              <div style={{ color: '#666', fontSize: 13 }}>{r.username ? `@${r.username}` : ''} {r.email && `• ${r.email}`}</div>
            </div>
            <div>
              <button onClick={() => toggleFollow(r._id, !!r.following)} className={r.following ? 'btn-secondary' : 'btn-primary'} disabled={!!loadingMap[r._id]}>
                {loadingMap[r._id] ? '…' : (r.following ? 'Unfollow' : 'Follow')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
