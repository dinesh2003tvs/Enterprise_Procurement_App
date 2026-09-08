import React from 'react';
import { STATUS_META } from '../utils/constants';

export const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || {
    label: status,
    color: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-xs ${meta.color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80 animate-pulse"></span>
      {meta.label}
    </span>
  );
};

