import React from 'react';

export default function SearchBar({ value, onChange, onSearch }) {
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="search-bar">
      <input
        aria-label="search"
        placeholder="Search"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button onClick={onSearch}>Search</button>
    </div>
  );
}
