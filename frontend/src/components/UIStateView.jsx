import React from 'react';
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';

export const LoadingState = ({ message = 'Loading requests...' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-slate-500">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export const EmptyState = ({
  title = 'No records found',
  message = 'No purchase requests match your criteria.',
  action = null
}) => (
  <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
      <Inbox className="w-6 h-6" />
    </div>
    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
    <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorState = ({
  title = 'Unable to load data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry = null
}) => (
  <div className="flex flex-col items-center justify-center p-8 bg-rose-50 rounded-xl border border-rose-200 text-center">
    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
      <AlertTriangle className="w-5 h-5" />
    </div>
    <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
    <p className="text-xs text-rose-700 mt-1 max-w-md">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);
