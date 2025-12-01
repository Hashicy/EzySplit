import React, { useEffect, useMemo, useState } from 'react';
import { createGroup } from '../api/groupApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getUser } from '../api/users';

export default function CreateGroupPage() {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]); // array of user ids
  const [loading, setLoading] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const { user } = useAuth();
  const nav = useNavigate();

  // fetch details of users the current user is following
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!user?.following?.length) return setFollowingList([]);
        const ids = user.following.slice(0, 200); // limit
        const promises = ids.map(id => getUser(id).catch(() => null));
        const results = await Promise.all(promises);
        if (!mounted) return;
        setFollowingList(results.filter(Boolean).map(r => r.user));
      } catch (err) {
        console.error('Failed to load following', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user?.following]);

  const toggle = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const selectedCount = useMemo(() => selected.length, [selected]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
  const payload = { name, members: selected };
  console.debug('createGroup payload:', payload);
  const res = await createGroup(payload);
      nav(`/groups/${res.group._id || res.group.id}`);
    } catch (err) {
  console.error('createGroup failed', err);
  // try to surface server response
  const serverMsg = err?.response?.data || err?.message || err;
  console.debug('createGroup server response:', serverMsg);
  alert(typeof serverMsg === 'string' ? serverMsg : (serverMsg?.error || 'Failed to create'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Create group</h3>
      <form onSubmit={onSubmit} style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 8 }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Members (choose from people you follow)</label>
          <div style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6, maxHeight: 260, overflow: 'auto' }}>
            {followingList.length === 0 && <div style={{ color: '#666' }}>You are not following anyone yet.</div>}
            {followingList.map(u => (
              <label key={u.id || u._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
                <input type="checkbox" checked={selected.includes(String(u.id || u._id))} onChange={() => toggle(String(u.id || u._id))} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 600 }}>{u.name || u.username || 'Unnamed'}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{u.username ? `@${u.username}` : u.email}</div>
                </div>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#444' }}>{selectedCount} selected</div>
        </div>

        <div style={{ marginTop: 10 }}>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
        </div>
      </form>
    </div>
  );
}
