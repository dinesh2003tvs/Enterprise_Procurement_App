import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

export const StatusStepper = ({ status }) => {
  const steps = [
    { id: 'SUBMITTED', label: 'Submitted' },
    { id: 'MANAGER_APPROVED', label: 'Manager Approved' },
    { id: 'FINANCE_APPROVED', label: 'Finance Validated' },
    { id: 'PROCUREMENT_STARTED', label: 'Vendor & Order' },
    { id: 'PAYMENT_PENDING', label: 'Settlement' },
    { id: 'COMPLETED', label: 'Delivered' }
  ];

  // Map state to progress index
  const statusOrder = {
    DRAFT: 0,
    SUBMITTED: 1,
    MANAGER_APPROVED: 2,
    SENIOR_MANAGER_APPROVED: 2,
    FINANCE_APPROVED: 3,
    PROCUREMENT_STARTED: 4,
    PAYMENT_PENDING: 5,
    COMPLETED: 6,
    REJECTED: -1,
    CANCELLED: -2,
    PAYMENT_FAILED: 4
  };

  const currentIndex = statusOrder[status] !== undefined ? statusOrder[status] : 0;
  const isRejected = status === 'REJECTED';
  const isCancelled = status === 'CANCELLED';

  if (isRejected || isCancelled) {
    return (
      <div className={`p-4 rounded-xl border ${isRejected ? 'bg-rose-950/40 border-rose-500/30 text-rose-200 shadow-glow-rose' : 'bg-slate-800/50 border-slate-700/60 text-slate-300'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRejected ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'}`}>
            {isRejected ? <X className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">
              {isRejected ? 'Purchase Request Rejected' : 'Purchase Request Cancelled'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRejected
                ? 'This request was rejected by an approver. You may review comments and resubmit.'
                : 'This request was cancelled by the requester and is no longer active.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.max(0, ((currentIndex - 1) / (steps.length - 1)) * 100));

  return (
    <div className="py-5 px-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting track line */}
        <div className="absolute top-4 left-6 right-6 h-1 bg-slate-800/90 rounded-full -z-0">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 shadow-glow-blue"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = currentIndex > stepNum;
          const isCurrent = currentIndex === stepNum;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isDone
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                    : isCurrent
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/40 animate-pulse'
                    : 'bg-slate-900 text-slate-500 border border-slate-700/80 shadow-inner'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
              </div>
              <span
                className={`mt-2.5 text-[11px] text-center font-medium max-w-[85px] leading-tight transition-colors ${
                  isDone
                    ? 'text-emerald-400 font-semibold'
                    : isCurrent
                    ? 'text-white font-bold'
                    : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

