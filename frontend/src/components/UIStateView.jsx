import React from 'react';
import { Loader2, AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export const LoadingState = ({ message = 'Loading pipeline data...' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-slate-400">
    <div className="relative mb-4">
      <div className="w-12 h-12 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
      <div className="absolute inset-0 w-12 h-12 rounded-full blur-sm bg-brand-500/20 animate-pulse" />
    </div>
    <p className="text-sm font-medium tracking-wide text-slate-300">{message}</p>
    <p className="text-xs text-slate-500 mt-1">Synchronizing with enterprise procurement engine</p>
  </div>
);

export const EmptyState = ({
  title = 'No records found',
  message = 'No purchase requests match your current criteria.',
  action = null
}) => (
  <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl border border-dashed border-slate-700/60 text-center shadow-lg my-4">
    <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
      <Inbox className="w-7 h-7 text-slate-400" />
    </div>
    <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
    <p className="text-xs text-slate-400 mt-1.5 max-w-md leading-relaxed">{message}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const ErrorState = ({
  title = 'Unable to load pipeline data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry = null
}) => (
  <div className="flex flex-col items-center justify-center p-8 glass-panel rounded-2xl border border-rose-500/30 text-center shadow-lg my-4 relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3.5">
      <AlertTriangle className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-bold text-white">{title}</h3>
    <p className="text-xs text-slate-400 mt-1.5 max-w-md leading-relaxed">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all inline-flex items-center space-x-1.5"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </button>
    )}
  </div>
);

