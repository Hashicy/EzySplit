import React, { useEffect, useState } from 'react';
import '../styles/ExpenseCard.css';

export default function ExpenseCard({ expense, isEditing = false, onSave, onCancelEdit }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', paidBy: '', category: '', date: '', participants: '' });

  useEffect(() => {
    setEditing(Boolean(isEditing));
  }, [isEditing]);

  useEffect(() => {
    // initialize form from expense when editing starts
    if (editing) {
      setForm({
        title: expense.title || '',
        amount: expense.amount || '',
        paidBy: expense.paidBy || '',
        category: expense.category || '',
        date: expense.date ? expense.date.split('T')[0] : '',
        participants: (expense.participants || []).join(', ')
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const handleSave = async () => {
    if (onSave) {
      const payload = {
        title: form.title,
        amount: Number(form.amount) || 0,
        paidBy: form.paidBy,
        category: form.category,
        date: form.date || undefined,
        participants: form.participants ? form.participants.split(',').map(s => s.trim()) : []
      };
      await onSave(expense.id || expense._id || expense.id, payload);
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (onCancelEdit) onCancelEdit();
  };

  if (!editing) {
    return (
      <div className="expense-card">
        <h3>{expense.title}</h3>
        <div>Amount: {expense.amount}</div>
        <div>Paid by: {expense.paidBy}</div>
        <div>Category: {expense.category}</div>
        <div>Date: {expense.date ? new Date(expense.date).toLocaleDateString() : ''}</div>
        <div>Participants: {(expense.participants || []).join(', ')}</div>
      </div>
    );
  }

  return (
    <div className="expense-card">
      <div style={{ display: 'grid', gap: 8 }}>
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount" />
          <input value={form.paidBy} onChange={e => setForm(f => ({ ...f, paidBy: e.target.value }))} placeholder="Paid by" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Category" />
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <input value={form.participants} onChange={e => setForm(f => ({ ...f, participants: e.target.value }))} placeholder="Participants (comma separated)" />
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button className="btn-primary" onClick={handleSave}>Save</button>
          <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
