import React, { useEffect, useState } from 'react';
import { getMe as getMeApi, updateMe } from '../api/users.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [me, setMe] = useState(user);
  const [editing, setEditing] = useState({ name: user?.name || '', username: user?.username || '' });
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getMeApi();
        if (res.user) setMe(res.user);
      } catch {
        // ignore
      }
    })();
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // prefer users.updateMe endpoint so followers/following are returned
      const res = await updateMe(editing);
      if (res.user) { setUser(res.user); setMe(res.user); }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || 'Failed to save profile');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '20px auto' }}>
      <h2>My Profile</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ minWidth: 220 }}>
          <div style={{ width: 160, height: 160, borderRadius: 12, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{(me?.name||me?.username||'U').slice(0,2).toUpperCase()}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 12 }}><strong>Name:</strong> {me?.name}</div>
          <div style={{ marginBottom: 12 }}><strong>Username:</strong> {me?.username}</div>
          <div style={{ marginBottom: 12 }}><strong>Email:</strong> {me?.email}</div>
          <div style={{ marginBottom: 12 }}><strong>Followers:</strong> {me?.followers?.length || 0} <strong style={{ marginLeft: 12 }}>Following:</strong> {me?.following?.length || 0}</div>

          <form onSubmit={onSave} style={{ marginTop: 16 }}>
            {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
            <div style={{ marginBottom: 8 }}>
              <label>Name</label>
              <input style={{ width: '100%', padding: 8 }} value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Username</label>
              <input style={{ width: '100%', padding: 8 }} value={editing.username} onChange={e => setEditing({ ...editing, username: e.target.value })} />
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="btn-primary" type="submit">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
