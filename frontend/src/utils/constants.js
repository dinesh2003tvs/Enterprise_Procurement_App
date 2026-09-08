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
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  MANAGER_APPROVED: { label: 'Manager Approved', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  SENIOR_MANAGER_APPROVED: { label: 'Senior Mgr Approved', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  FINANCE_APPROVED: { label: 'Finance Approved', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  PROCUREMENT_STARTED: { label: 'Procurement Started', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-300' },
  REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600 border-gray-300' },
  PAYMENT_FAILED: { label: 'Payment Failed', color: 'bg-red-100 text-red-700 border-red-300' }
};

