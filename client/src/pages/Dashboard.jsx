import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useState } from 'react';
import '../styles/Dashboard.css';
import { getExpenses, getSummarySplit } from '../api/expenseApi';
import { timeAgo } from '../utils/timeago';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ total: 0, sum: 0 });
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    (async ()=>{
      try {
        const res = await getExpenses({ page: 1, limit: 1000 });
  const total = res.meta?.total || 0;
  const all = res.data || [];
  // sort by date desc and take up to 5
  const sorted = all.slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
  const sum = all.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const recent = sorted.slice(0, 5);
  setStats({ total, sum, recent });
        try {
          const s = await getSummarySplit();
          setSummary(s);
        } catch (e) {
          console.error('summary split failed', e);
          const msg = e?.response?.data?.error || e?.message || 'Failed to load';
          setSummary({ error: true, message: msg });
        }
      } catch (e) { console.error(e); }
    })();
  }, [user]);

  if (loading) return <div className="dashboard container">Loading...</div>;

  if (!user) {
    return (
      <div className="dashboard-guest">
        <div className="hero">
          <h1>Welcome to EzySplit</h1>
          <p>Simplify splitting bills and tracking group expenses. Sign up or log in to get started.</p>
          <div className="cta">
            <button onClick={()=>navigate('/signup')} className="btn-primary">Get started</button>
            <button onClick={()=>navigate('/login')} className="btn-secondary">Log in</button>
          </div>
          <div className="steps">
            <h4>Get started in 3 steps</h4>
            <ol>
              <li>Create an account</li>
              <li>Add your friends</li>
              <li>Start adding expenses</li>
            </ol>
          </div>
        </div>
        <div className="preview">
          <h3>Features</h3>
          <ul>
            <li>Track expenses and who paid</li>
            <li>Filter and sort your expenses</li>
            <li>Share expenses with friends</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard container">
      <div className="summary-top">
        <h2>Group settlement</h2>
        {summary === null ? <div>Loading settlements...</div> : summary.error ? (
          <div className="summary-error">Could not load settlements: {summary.message}</div>
        ) : (
          <div className="summary-panel">
            <div>Total expenses: {summary.totals.count} — ₹{Number(summary.totals.amount).toFixed(2)}</div>
            <div className="settle-list">
              <h4>Minimal payments</h4>
              {summary.settlements.length===0 ? <div>All settled</div> : (
                <ol>
                  {summary.settlements.map((s, i) => (
                    <li key={i}>{s.from} → {s.to}: ₹{s.amount.toFixed(2)}</li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
      <h2>Welcome back, {user.name || user.email}</h2>
      <div className="stats">
        <div className="stat">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Expenses</div>
        </div>
        <div className="stat">
          <div className="stat-number">₹{stats.sum.toFixed(2)}</div>
          <div className="stat-label">Total spent</div>
        </div>
      </div>
      <div className="actions">
        <button className="btn-primary" onClick={()=>navigate('/expenses')}>View expenses</button>
        <button className="btn-secondary" onClick={()=>navigate('/expenses')}>Add expense</button>
      </div>

      <div className="recent">
        <h3>Recent activity</h3>
        <ul>
          {(stats.recent || []).length === 0 ? <li>No recent activity</li> : stats.recent.map(r => (
            <li key={r.id}>{r.title} • ₹{Number(r.amount).toFixed(2)} • {r.paidBy} • {timeAgo(r.date)}</li>
          ))}
        </ul>
      </div>

      <div className="tips">
        <h4>Quick tips</h4>
        <ul>
          <li>Use filters to find expenses quickly</li>
          <li>Click an expense to edit or delete</li>
        </ul>
      </div>
  {/* summary panel displayed at the top */}
    </div>
  );
}