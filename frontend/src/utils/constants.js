export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  FINANCE: 'FINANCE',
  PROCUREMENT_ADMIN: 'PROCUREMENT_ADMIN',
  SENIOR_MANAGER: 'SENIOR_MANAGER'
};

export const DEMO_ACCOUNTS = [
  {
    role: ROLES.EMPLOYEE,
    label: 'Employee',
    name: 'Sarah Connor',
    email: 'employee@company.com',
    department: 'Engineering',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    role: ROLES.MANAGER,
    label: 'Manager',
    name: 'Michael Scott',
    email: 'manager@company.com',
    department: 'Engineering',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    role: ROLES.FINANCE,
    label: 'Finance',
    name: 'Oscar Martinez',
    email: 'finance@company.com',
    department: 'Finance',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    role: ROLES.PROCUREMENT_ADMIN,
    label: 'Procurement Admin',
    name: 'Angela Martin',
    email: 'procurement@company.com',
    department: 'Procurement',
    badgeColor: 'bg-amber-100 text-amber-800'
  }
];

export const CATEGORIES = [
  { id: 'IT_EQUIPMENT', label: 'IT Equipment' },
  { id: 'SOFTWARE', label: 'Software & Licenses' },
  { id: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
  { id: 'TRAVEL', label: 'Travel & Logistics' },
  { id: 'TRAINING', label: 'Training & Development' },
  { id: 'OTHER', label: 'Other Operational Expenses' }
];

export const PRIORITIES = [
  { id: 'LOW', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { id: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { id: 'HIGH', label: 'High', color: 'bg-amber-100 text-amber-700' },
  { id: 'CRITICAL', label: 'Critical', color: 'bg-rose-100 text-rose-700' }
];

export const STATUS_META = {
  DRAFT: { label: 'Draft', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  MANAGER_APPROVED: { label: 'Manager Approved', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  SENIOR_MANAGER_APPROVED: { label: 'Manager Approved', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  FINANCE_APPROVED: { label: 'Finance Approved', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  PROCUREMENT_STARTED: { label: 'Procurement Started', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  COMPLETED: { label: 'Completed', color: 'bg-green-500/15 text-green-300 border-green-500/30' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  CANCELLED: { label: 'Cancelled', color: 'bg-slate-600/15 text-slate-400 border-slate-600/30' },
  PAYMENT_FAILED: { label: 'Payment Failed', color: 'bg-red-500/15 text-red-300 border-red-500/30' }
};

