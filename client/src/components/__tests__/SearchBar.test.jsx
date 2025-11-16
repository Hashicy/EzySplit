import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import SearchBar from '../SearchBar.jsx';

test('search input and button work', () => {
  const onChange = vi.fn();
  const onSearch = vi.fn();
  render(<SearchBar value="" onChange={onChange} onSearch={onSearch} />);
  const input = screen.getByPlaceholderText(/Search/);
  fireEvent.change(input, { target: { value: 'abc' } });
  expect(onChange).toHaveBeenCalled();
  const btn = screen.getByText(/Search/);
  fireEvent.click(btn);
  expect(onSearch).toHaveBeenCalled();
});
