import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

export const StatusStepper = ({ status }) => {
  const steps = [
    { id: 'SUBMITTED', label: 'Submitted' },
    { id: 'MANAGER_APPROVED', label: 'Manager Approval' },
    { id: 'FINANCE_APPROVED', label: 'Finance Approval' },
    { id: 'PROCUREMENT_STARTED', label: 'Procurement' },
    { id: 'PAYMENT_PENDING', label: 'Payment' },
    { id: 'COMPLETED', label: 'Completed' }
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
      <div className={`p-4 rounded-xl border ${isRejected ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
        <div className="flex items-center space-x-3">
          {isRejected ? <X className="w-5 h-5 text-rose-600" /> : <AlertCircle className="w-5 h-5 text-slate-600" />}
          <div>
            <h4 className="font-semibold text-sm">
              {isRejected ? 'Request Rejected' : 'Request Cancelled'}
            </h4>
            <p className="text-xs opacity-80">
              {isRejected
                ? 'This request was rejected. You may edit and resubmit if allowed.'
                : 'This request was cancelled and is no longer active.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, ((currentIndex - 1) / (steps.length - 1)) * 100))}%`
            }}
          />
        </div>

        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = currentIndex > stepNum;
          const isCurrent = currentIndex === stepNum;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${
                  isDone
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
              </div>
              <span
                className={`mt-2 text-xs text-center font-medium max-w-[80px] leading-tight ${
                  isDone || isCurrent ? 'text-slate-900 font-semibold' : 'text-slate-400'
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

