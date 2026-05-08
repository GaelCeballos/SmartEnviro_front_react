import React from 'react';

export const Button = ({ children, onClick, type = 'button', disabled = false, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-14 rounded-full font-bold text-lg flex items-center justify-center transition-transform shadow-md
        ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white active:scale-95 hover:bg-opacity-90'} 
        ${className}
      `}
    >
      {children}
    </button>
  );
};