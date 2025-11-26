import React, { useEffect, useState } from 'react';
import '../styles/ExpensesPage.css';
import { useLocation } from 'react-router-dom';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenseApi';
import ExpenseCard from '../components/ExpenseCard.jsx';
import SearchBar from '../components/SearchBar.jsx';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', amount: '', paidBy: '', category: '', date: '', participants: '' });
  const [editingId, setEditingId] = useState(null);
  // filters removed per request
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSort, setShowSort] = useState(false);
  const [flash, setFlash] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.flash) setFlash(location.state.flash);
  }, [location.state]);

  // load expenses with optional overrides to avoid stale state when calling immediately after setState
  const load = async (page = 1, overrides = {}) => {
    setLoading(true);
    try {
      const effectivePage = page;
      const effectiveLimit = overrides.limit ?? pageSize ?? meta.limit;
      const effectiveSearch = overrides.search ?? search;
      const effectiveSort = overrides.sort ?? sortField;
      const effectiveOrder = overrides.order ?? sortOrder;
  const params = { page: effectivePage, limit: effectiveLimit, search: effectiveSearch, sort: effectiveSort, order: effectiveOrder };
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

  // filters removed

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
        <div className="filters-top">
          <SearchBar value={search} onChange={setSearch} onSearch={()=>load(1)} />
          <div className="toggle-group">
            <button className="sort-toggle" onClick={()=>setShowSort(s=>!s)}>{showSort ? 'Hide sort' : 'Sort'}</button>
          </div>
        </div>

        {showSort && (
          <div className="sort-panel">
            <div className="sort-control">
              <label htmlFor="sortField">Sort by</label>
              <select id="sortField" value={sortField} onChange={e=>{ const v = e.target.value; setSortField(v); load(1, { sort: v }); }}>
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="title">Title</option>
                <option value="paidBy">Paid by</option>
              </select>
            </div>
            <div className="sort-control">
              <label htmlFor="sortOrder">Order</label>
              <select id="sortOrder" value={sortOrder} onChange={e=>{ const v = e.target.value; setSortOrder(v); load(1, { order: v }); }}>
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
          </div>
        )}

  {/* filters removed */}
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
            <div className="pager">
              <button className="pager-btn" disabled={meta.page<=1} onClick={()=>load(meta.page-1)}>Prev</button>

              {/* render page numbers */}
              {(() => {
                const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (pageSize || meta.limit)));
                const pages = [];
                const start = Math.max(1, meta.page - 2);
                const end = Math.min(totalPages, meta.page + 2);
                for (let p = start; p <= end; p++) pages.push(p);
                return pages.map(p => (
                  <button key={p} className={`pager-btn ${p===meta.page? 'active':''}`} onClick={()=>load(p)}>{p}</button>
                ));
              })()}

              <button className="pager-btn" disabled={meta.page* (pageSize || meta.limit) >= meta.total} onClick={()=>load(meta.page+1)}>Next</button>
            </div>

            <div className="page-size">
              <label htmlFor="pageSize">Per page</label>
              <select id="pageSize" value={pageSize} onChange={e=>{ const v = Number(e.target.value); setPageSize(v); load(1, { limit: v }); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
