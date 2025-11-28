/* global test, expect */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
/* eslint-env vitest */
import ExpenseCard from '../ExpenseCard.jsx';

test('renders expense card fields', () => {
  const exp = { title: 'X', amount: 10, paidBy: 'A', category: 'Food', date: '2025-01-01', participants: ['a','b'] };
  render(<ExpenseCard expense={exp} />);
  expect(screen.getByText(/X/)).toBeInTheDocument();
  expect(screen.getByText(/Amount: 10/)).toBeInTheDocument();
  expect(screen.getByText(/Paid by: A/)).toBeInTheDocument();
});
