import React from 'react';
import { STATUS_META } from '../utils/constants';

export const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || {
    label: status,
    color: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {meta.label}
    </span>
  );
};
