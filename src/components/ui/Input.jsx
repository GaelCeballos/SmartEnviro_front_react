import React from 'react';

export const Input = ({ label, type = 'text', placeholder, value, onChange }) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-textDark text-base font-semibold mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-14 bg-surface px-4 rounded-xl text-textDark text-base border border-gray-200 shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-textLight"
      />
    </div>
  );
};
