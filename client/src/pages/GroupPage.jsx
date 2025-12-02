import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroup, getGroupExpenses, updateMembers, deleteGroup } from '../api/groupApi';

export default function GroupPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [membersInput, setMembersInput] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0 });

  const load = async (p = 1) => {
    try {
      const g = await getGroup(id);
  setGroup(g.group || g);
      const res = await getGroupExpenses(id, { page: p, limit: 10 });
      setExpenses(res.data || res);
      setMeta(res.meta || { total: (res.data || []).length });
    } catch (err) { console.error(err); }
  };

  useEffect(() => { load(1); }, [id]);

  const onAddMembers = async () => {
    const add = membersInput.split(',').map(s => s.trim()).filter(Boolean);
    if (!add.length) return;
    try {
      const res = await updateMembers(id, { add });
      setGroup(res.group);
      setMembersInput('');
    } catch (err) { console.error(err); alert('Failed'); }
  };

  const onRemove = async (member) => {
    try {
      const res = await updateMembers(id, { remove: [member] });
      setGroup(res.group);
    } catch (err) { console.error(err); alert('Failed'); }
  };

  const navigate = useNavigate();

  const onDelete = async () => {
    try {
      await deleteGroup(id);
      navigate('/groups');
    } catch (err) { console.error(err); alert('Failed'); }
  };

  return (
    <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
      {!group ? <div>Loading...</div> : (
        <div style={{ width: '100%', maxWidth: 900, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>{group.name}</h3>
            <div style={{ fontSize: 13, color: '#666' }}>Owner: <strong>{group.owner && (group.owner.name || group.owner.username || String(group.owner))}</strong></div>
          </div>
          <div style={{ marginTop: 12 }}>
            <strong>Members</strong>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {(group.members || []).map(m => {
                const label = (m && (m.name || m.username || m.email)) || String(m);
                const id = (m && (m._id || m.id)) || null;
                const removeValue = id || label;
                return (
                  <div key={id || label} style={{ padding: '6px 10px', background: '#f3f4f6', borderRadius: 18, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13 }}>{label}</span>
                    <button onClick={() => onRemove(removeValue)} className="btn-secondary" style={{ padding: '4px 6px' }}>Remove</button>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <input placeholder="Add by userId or comma-separated names" value={membersInput} onChange={e => setMembersInput(e.target.value)} />
              <button onClick={onAddMembers} className="btn-primary">Add</button>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <h4>Group expenses ({meta.total})</h4>
            <ul>
              {expenses.map(exp => (
                <li key={exp._id || exp.id}>{exp.title} — {exp.amount} — {new Date(exp.date).toLocaleDateString()}</li>
              ))}
            </ul>
            <div style={{ marginTop: 8 }}>
              <button disabled={page<=1} onClick={() => { setPage(p=>p-1); load(page-1); }}>Prev</button>
              <span style={{ margin: '0 8px' }}>{page}</span>
              <button disabled={page*10 >= meta.total} onClick={() => { setPage(p=>p+1); load(page+1); }}>Next</button>
            </div>
          </div>

          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <button className="btn-secondary" onClick={onDelete}>Delete group</button>
          </div>
        </div>
      )}
    </div>
  );
}
