import React from 'react';

export default function Card({ children, className = '', hover = true, padding = 'p-5' }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-agri-200 shadow-sm ${padding} ${
        hover ? 'hover:border-agri-300 hover:shadow-md transition duration-200 transform hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
