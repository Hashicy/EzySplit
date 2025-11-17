import React, { useMemo, useState } from 'react';
import { minCashFlow } from '../utils/settle';

function sumObject(obj) {
  return Object.values(obj).reduce((s, v) => s + (Number(v) || 0), 0);
}

export default function CustomExpenseSplit({ expense }) {
  const participants = useMemo(() => (expense.participants && expense.participants.length ? expense.participants : [expense.paidBy]), [expense]);
  const total = Number(expense.amount || 0);
  const [mode, setMode] = useState('percent'); // 'percent' | 'amount' | 'some-fixed'
  const [values, setValues] = useState(() => {
    const equal = total / participants.length;
    const init = {};
    participants.forEach(p => { init[p] = Number((mode === 'percent' ? (100 / participants.length) : equal).toFixed(2)); });
    return init;
  });
  const [fixed, setFixed] = useState(() => ({})); // map person -> boolean
  const [settlements, setSettlements] = useState([]);
  const [error, setError] = useState(null);

  const onChange = (person, v) => {
    setValues(prev => ({ ...prev, [person]: v }));
  };

  const compute = () => {
    setError(null);
    // normalize to amounts
    let amounts = {};
    if (mode === 'percent') {
      const totalPercent = sumObject(values);
      if (Math.abs(totalPercent - 100) > 0.5) {
        setError('Percents must sum to ~100%');
        return;
      }
      participants.forEach(p => {
        const pct = Number(values[p] || 0);
        amounts[p] = Number(((pct / 100) * total).toFixed(2));
      });
    } else if (mode === 'amount') {
      const sum = sumObject(values);
      if (Math.abs(sum - total) > 0.5) {
        setError('Amounts must sum to total');
        return;
      }
      participants.forEach(p => { amounts[p] = Number((values[p] || 0).toFixed(2)); });
    } else if (mode === 'some-fixed') {
      // fixed entries provided in values for participants with fixed[p]===true
      // compute remaining total for others and split equally
      const fixedPeople = participants.filter(p=>fixed[p]);
      const freePeople = participants.filter(p=>!fixed[p]);
      const fixedSum = sumObject(fixedPeople.reduce((o,p)=>({ ...o, [p]: values[p] || 0 }), {}));
      const rem = Number((total - fixedSum).toFixed(2));
      if (rem < -0.5) { setError('Fixed amounts exceed total'); return; }
      const perFree = freePeople.length ? Number((rem / freePeople.length).toFixed(2)) : 0;
      participants.forEach(p => {
        if (fixed[p]) amounts[p] = Number((values[p] || 0).toFixed(2));
        else amounts[p] = perFree;
      });
    }

    // compute balances: payer paid total, so their balance is total - their share
    const balances = {};
    participants.forEach(p => balances[p] = 0);
    balances[expense.paidBy] = Number((total - amounts[expense.paidBy]).toFixed(2));
    participants.forEach(p => { if (p !== expense.paidBy) balances[p] = Number((-amounts[p]).toFixed(2)); });

    const s = minCashFlow(balances);
    setSettlements(s);
  };

  return (
    <div className="custom-expense-split">
      <div className="mode-toggle">
        <label>
          <input type="radio" checked={mode==='percent'} onChange={()=>setMode('percent')} /> Percent
        </label>
        <label>
          <input type="radio" checked={mode==='amount'} onChange={()=>setMode('amount')} /> Amount
        </label>
      </div>
      <div className="inputs">
        {participants.map(p => (
          <div className="row" key={p}>
            <label>{p}</label>
            {mode === 'some-fixed' ? (
              <>
                <input type="checkbox" checked={!!fixed[p]} onChange={(e)=>setFixed(f=>({ ...f, [p]: e.target.checked }))} /> Fixed
                <input type="number" step="0.01" value={values[p]} onChange={(e)=>onChange(p, Number(e.target.value))} />
              </>
            ) : (
              <input type="number" step="0.01" value={values[p]} onChange={(e)=>onChange(p, Number(e.target.value))} />
            )}
          </div>
        ))}
      </div>
      {error && <div className="error">{error}</div>}
      <div className="actions">
        <button onClick={compute} className="btn-primary">Compute</button>
      </div>
      <div className="results">
        {settlements.length===0 ? <div>No settlements</div> : (
          <ul>
            {settlements.map((s,i)=>(<li key={i}>{s.from} → {s.to}: ₹{s.amount.toFixed(2)}</li>))}
          </ul>
        )}
      </div>
    </div>
  );
}
