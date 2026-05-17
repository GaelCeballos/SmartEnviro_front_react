import React from 'react';

export const Card = ({ children, className = '', onClick, ...props }) => {
  return (
    <div 
      className={`bg-white shadow-sm border-0 rounded-2xl ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};