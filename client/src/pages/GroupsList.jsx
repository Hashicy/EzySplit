import React, { useEffect, useState } from 'react';
import { listMyGroups } from '../api/groupApi';
import { Link } from 'react-router-dom';

export default function GroupsList() {
  const [groups, setGroups] = useState([]);
  useEffect(() => { listMyGroups().then(r => setGroups(r.groups || r)); }, []);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>My groups</h3>
        <Link to="/groups/new" className="btn-primary">New group</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {groups.map(g => {
          const id = g._id || g.id;
          const ownerLabel = (g.owner && (g.owner.name || g.owner.username || g.owner.email)) || String(g.owner || '');
          const members = g.members || [];
          return (
            <Link to={`/groups/${id}`} key={id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{g.name}</div>
                  <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>Owner: {ownerLabel}</div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>{members.length} members</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {members.slice(0,6).map((m, i) => (
                      <div key={i} style={{ background: '#f3f4f6', padding: '6px 8px', borderRadius: 6, fontSize: 13 }}>{(m && (m.name || m.username)) || String(m)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
