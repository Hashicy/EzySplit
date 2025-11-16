import React, { useEffect, useState } from 'react';
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
    <div className="p-6">
      <h2 className="text-2xl mb-4">Expenses</h2>

      {flash && <div className="flash">{flash}</div>}

      <form onSubmit={onSubmit} className="mb-6">
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
        <input placeholder="Amount" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} />
        <input placeholder="Paid by" value={form.paidBy} onChange={e=>setForm({...form,paidBy:e.target.value})} />
        <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
        <input type="date" placeholder="Date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
        <input placeholder="Participants (comma separated)" value={form.participants} onChange={e=>setForm({...form,participants:e.target.value})} />
        <button type="submit">Add</button>
      </form>

      <div className="filters mb-4">
        <SearchBar value={search} onChange={setSearch} onSearch={()=>load(1)} />
        <input placeholder="Category" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})} />
        <input placeholder="Paid by" value={filters.paidBy} onChange={e=>setFilters({...filters,paidBy:e.target.value})} />
        <input type="date" placeholder="From" value={filters.from} onChange={e=>setFilters({...filters,from:e.target.value})} />
        <input type="date" placeholder="To" value={filters.to} onChange={e=>setFilters({...filters,to:e.target.value})} />
        <button onClick={onApplyFilters}>Apply</button>
      </div>

      {loading ? <div>Loading...</div> : (
        <div>
          <div>Total: {meta.total}</div>
          <ul>
            {expenses.map(exp => (
              <li key={exp.id}>
                <ExpenseCard expense={exp} />
                <div className="actions">
                  <button onClick={()=>onEdit(exp)}>Edit</button>
                  <button onClick={()=>onDelete(exp.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <button disabled={meta.page<=1} onClick={()=>load(meta.page-1)}>Previous</button>
            <span className="px-2">Page {meta.page}</span>
            <button disabled={meta.page*meta.limit>=meta.total} onClick={()=>load(meta.page+1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
