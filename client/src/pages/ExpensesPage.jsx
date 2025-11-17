import React, { useEffect, useState } from 'react';
import '../styles/ExpensesPage.css';
import { useLocation } from 'react-router-dom';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenseApi';
import ExpenseCard from '../components/ExpenseCard.jsx';
import SearchBar from '../components/SearchBar.jsx';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', amount: '', paidBy: '', category: '', date: '', participants: '' });
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ category: '', paidBy: '', from: '', to: '' });
  const [flash, setFlash] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.flash) setFlash(location.state.flash);
  }, [location.state]);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: meta.limit, search, ...filters };
      // remove empty params
      Object.keys(params).forEach(k => { if (params[k] === '' || params[k] == null) delete params[k]; });
      const res = await getExpenses(params);
      setExpenses(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const participants = form.participants ? form.participants.split(',').map(s => s.trim()) : [];
    try {
      if (editingId) {
        await updateExpense(editingId, { ...form, amount: Number(form.amount), participants });
        setFlash('Expense updated');
        setEditingId(null);
      } else {
        await createExpense({ ...form, amount: Number(form.amount), participants });
        setFlash('Expense added');
      }
      setForm({ title: '', amount: '', paidBy: '', category: '', date: '', participants: '' });
      load(1);
    } catch (err) { console.error(err); }
  };

  const onEdit = (expense) => {
    setEditingId(expense.id);
    setForm({
      title: expense.title || '',
      amount: expense.amount || '',
      paidBy: expense.paidBy || '',
      category: expense.category || '',
      date: expense.date ? expense.date.split('T')[0] : '',
      participants: (expense.participants || []).join(', ')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      setFlash('Expense deleted');
      load(1);
    } catch (err) { console.error(err); }
  };

  const onApplyFilters = () => {
    load(1);
  };

  return (
    <div className="expenses-page">
      <header className="header">
        <h2>Expenses</h2>
        <div className="header-meta">Total: <strong>{meta.total}</strong></div>
      </header>

      {flash && <div className="flash">{flash}</div>}

      <section className="expense-form">
        <form onSubmit={onSubmit}>
          <div className="row">
            <div>
              <label>Title</label>
              <input placeholder="Dinner at Cafe" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            </div>
            <div>
              <label>Amount</label>
              <input placeholder="Amount" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} />
            </div>
          </div>

          <div className="row">
            <div>
              <label>Paid by</label>
              <input placeholder="Name" value={form.paidBy} onChange={e=>setForm({...form,paidBy:e.target.value})} />
            </div>
            <div>
              <label>Category</label>
              <input placeholder="Food, Travel" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
            </div>
          </div>

          <div className="row">
            <div>
              <label>Date</label>
              <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
            </div>
            <div>
              <label>Participants</label>
              <input placeholder="Isha, Aarav" value={form.participants} onChange={e=>setForm({...form,participants:e.target.value})} />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">{editingId ? 'Save changes' : 'Add expense'}</button>
            {editingId && <button type="button" className="btn-secondary" onClick={()=>{ setEditingId(null); setForm({ title: '', amount: '', paidBy: '', category: '', date: '', participants: '' }); }}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="filters">
        <SearchBar value={search} onChange={setSearch} onSearch={()=>load(1)} />
        <div className="filter-controls">
          <input placeholder="Category" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})} />
          <input placeholder="Paid by" value={filters.paidBy} onChange={e=>setFilters({...filters,paidBy:e.target.value})} />
          <input type="date" placeholder="From" value={filters.from} onChange={e=>setFilters({...filters,from:e.target.value})} />
          <input type="date" placeholder="To" value={filters.to} onChange={e=>setFilters({...filters,to:e.target.value})} />
          <button onClick={onApplyFilters}>Apply</button>
        </div>
      </section>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <section className="list">
          {expenses.length === 0 ? (
            <div className="empty">No expenses found — try adding one or adjusting filters.</div>
          ) : (
            <ul>
              {expenses.map(exp => (
                <li key={exp.id} className="expense-row">
                  <ExpenseCard expense={exp} />
                  <div className="actions">
                    <button className="btn-edit" onClick={()=>onEdit(exp)}>Edit</button>
                    <button className="btn-delete" onClick={()=>onDelete(exp.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="pagination">
            <button disabled={meta.page<=1} onClick={()=>load(meta.page-1)}>Previous</button>
            <span>Page {meta.page}</span>
            <button disabled={meta.page*meta.limit>=meta.total} onClick={()=>load(meta.page+1)}>Next</button>
          </div>
        </section>
      )}
    </div>
  );
}
