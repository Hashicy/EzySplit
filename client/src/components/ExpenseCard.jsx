import React from 'react';
import '../styles/ExpenseCard.css';

export default function ExpenseCard({ expense }) {
  return (
    <div className="expense-card">
      <h3>{expense.title}</h3>
      <div>Amount: {expense.amount}</div>
      <div>Paid by: {expense.paidBy}</div>
      <div>Category: {expense.category}</div>
      <div>Date: {new Date(expense.date).toLocaleDateString()}</div>
      <div>Participants: {(expense.participants || []).join(', ')}</div>
    </div>
  );
}
