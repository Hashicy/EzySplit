import React, { useCallback, useEffect, useState } from 'react';
import '../styles/ExpensesPage.css';
import { useLocation } from 'react-router-dom';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenseApi';
import { listMyGroups, getGroup } from '../api/groupApi';
import ExpenseCard from '../components/ExpenseCard.jsx';
import SearchBar from '../components/SearchBar.jsx';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', amount: '', paidBy: '', category: '', date: '', participants: '' });
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [editingId, setEditingId] = useState(null);
  // filters removed per request
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSort, setShowSort] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  // advanced filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaidBy, setFilterPaidBy] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterError, setFilterError] = useState('');
  const [flash, setFlash] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.flash) setFlash(location.state.flash);
  }, [location.state]);

  useEffect(() => {
    // load my groups for the group selector
    (async () => {
      try {
        const res = await listMyGroups();
        setGroups(res.groups || []);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  // load expenses with optional overrides to avoid stale state when calling immediately after setState
  const load = useCallback(async (page = 1, overrides = {}) => {
    setLoading(true);
    try {
      const effectivePage = page;
      const effectiveLimit = overrides.limit ?? pageSize ?? meta.limit;
      const effectiveSearch = overrides.search ?? search;
      const effectiveSort = overrides.sort ?? sortField;
      const effectiveOrder = overrides.order ?? sortOrder;
      // pick up filters from overrides if provided, otherwise from local state
      const effectiveCategory = overrides.category ?? filterCategory;
      const effectivePaidBy = overrides.paidBy ?? filterPaidBy;
      const effectiveFrom = overrides.from ?? filterFrom;
      const effectiveTo = overrides.to ?? filterTo;

      const params = {
        page: effectivePage,
        limit: effectiveLimit,
        search: effectiveSearch,
        sort: effectiveSort,
        order: effectiveOrder,
        category: effectiveCategory,
        paidBy: effectivePaidBy,
        from: effectiveFrom,
        to: effectiveTo,
      };
  // remove empty params
  Object.keys(params).forEach(k => { if (params[k] === '' || params[k] == null) delete params[k]; });
  // debug outgoing params for sorting/filtering issues
  // eslint-disable-next-line no-console
  console.debug('GET /api/expenses params', params);
  const res = await getExpenses(params);
  // eslint-disable-next-line no-console
  console.debug('GET /api/expenses response meta', res.meta, 'items', Array.isArray(res.data) ? res.data.length : 0);
      setExpenses(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  // include dependencies that affect what the backend will return
  }, [pageSize, meta.limit, search, sortField, sortOrder]);

  useEffect(() => { load(1); }, [load]);

  const setSortAndReload = (newSort, newOrder) => {
    setSortField(newSort);
    setSortOrder(newOrder);
    load(1, { sort: newSort, order: newOrder });
  };

  const applyFilters = () => {
    // clear previous error
    setFilterError('');
    if (filterFrom && filterTo) {
      const fromDate = new Date(filterFrom);
      const toDate = new Date(filterTo);
      if (fromDate > toDate) {
        setFilterError('Invalid date range: From must be before To');
        return;
      }
    }
    load(1, { category: filterCategory, paidBy: filterPaidBy, from: filterFrom, to: filterTo });
  };

  const resetFilters = () => {
    setFilterCategory(''); setFilterPaidBy(''); setFilterFrom(''); setFilterTo(''); setFilterError('');
    load(1, { category: '', paidBy: '', from: '', to: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const participants = form.participants ? form.participants.split(',').map(s => s.trim()) : [];
    try {
      if (editingId) {
        await updateExpense(editingId, { ...form, amount: Number(form.amount), participants, groupId: selectedGroupId || undefined });
        setFlash('Expense updated');
        setEditingId(null);
      } else {
        await createExpense({ ...form, amount: Number(form.amount), participants, groupId: selectedGroupId || undefined });
        setFlash('Expense added');
      }
      setForm({ title: '', amount: '', paidBy: '', category: '', date: '', participants: '' });
      setSelectedGroupId('');
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
    // if expense has a group, select it
    setSelectedGroupId(expense.groupId || '');
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
        <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
          <div className="header-meta">Total: <strong>{meta.total}</strong></div>
          <div className="header-sort" aria-live="polite">Sorted: <strong>{sortField}</strong> · <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span></div>
        </div>
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

          <div className="row">
            <div>
              <label>Group (optional)</label>
              <select value={selectedGroupId} onChange={async e => {
                const gid = e.target.value;
                setSelectedGroupId(gid);
                if (gid) {
                  try {
                    const g = await getGroup(gid);
                    const grp = g.group || g;
                    // derive participants from group members (names)
                    const parts = (grp.members || []).map(m => (m && (m.name || m.username || m.email)) || String(m));
                    setForm(f => ({ ...f, participants: parts.join(', ') }));
                  } catch (err) { console.error(err); }
                } else {
                  // clearing group - do not modify participants
                }
              }}>
                <option value="">-- none --</option>
                {groups.map(g => (
                  <option key={g._id || g.id} value={g._id || g.id}>{g.name}</option>
                ))}
              </select>
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
            <button className="sort-toggle" onClick={()=>setShowFilters(f=>!f)}>{showFilters ? 'Hide filters' : 'Show filters'}</button>
          </div>
        </div>

        {/* advanced filters */}
        {showFilters && (
          <div className="advanced-filters">
          <div className="filter-row">
            <div>
              <label>Category</label>
              <input placeholder="Food, Travel" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} />
            </div>
            <div>
              <label>Paid by</label>
              <input placeholder="Name" value={filterPaidBy} onChange={e => setFilterPaidBy(e.target.value)} />
            </div>
          </div>

          <div className="filter-row">
            <div>
              <label>From</label>
              <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
            </div>
            <div>
              <label>To</label>
              <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
            </div>
          </div>

          <div className="filter-actions">
            <button type="button" className="btn-primary" onClick={applyFilters}>Apply</button>
            <button type="button" className="btn-secondary" onClick={resetFilters}>Reset</button>
          </div>
          {filterError && <div className="filter-error" style={{ color: '#b91c1c', marginTop: 6 }}>{filterError}</div>}
          </div>
        )}

        {showSort && (
          <div className="sort-panel">
            <div className="sort-control">
              <label htmlFor="sortField">Sort by</label>
              <select id="sortField" value={sortField} onChange={e=>{ const v = e.target.value; setSortAndReload(v, sortOrder); }}>
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="title">Title</option>
                <option value="paidBy">Paid by</option>
              </select>
            </div>
            <div className="sort-control">
              <label htmlFor="sortOrder">Order</label>
              <select id="sortOrder" value={sortOrder} onChange={e=>{ const v = e.target.value; setSortAndReload(sortField, v); }}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
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
