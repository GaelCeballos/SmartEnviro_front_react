import React from 'react';

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 w-full ${className}`}>
      {children}
    </div>
  );
};