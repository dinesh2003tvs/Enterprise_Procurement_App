const bcrypt = require('bcryptjs');

const defaultPasswordHash = bcrypt.hashSync('password123', 10);

const initialUsers = [
  {
    id: 'usr-employee-1',
    name: 'Sarah Connor',
    email: 'employee@company.com',
    passwordHash: defaultPasswordHash,
    role: 'EMPLOYEE',
    department: 'Engineering',
    createdAt: new Date('2026-01-01T08:00:00Z')
  },
  {
    id: 'usr-manager-1',
    name: 'Michael Scott',
    email: 'manager@company.com',
    passwordHash: defaultPasswordHash,
    role: 'MANAGER',
    department: 'Engineering',
    createdAt: new Date('2026-01-01T08:00:00Z')
  },
  {
    id: 'usr-finance-1',
    name: 'Oscar Martinez',
    email: 'finance@company.com',
    passwordHash: defaultPasswordHash,
    role: 'FINANCE',
    department: 'Finance',
    createdAt: new Date('2026-01-01T08:00:00Z')
  },
  {
    id: 'usr-procurement-1',
    name: 'Angela Martin',
    email: 'procurement@company.com',
    passwordHash: defaultPasswordHash,
    role: 'PROCUREMENT_ADMIN',
    department: 'Procurement',
    createdAt: new Date('2026-01-01T08:00:00Z')
  },
  {
    id: 'usr-senior-1',
    name: 'David Wallace',
    email: 'seniormanager@company.com',
    passwordHash: defaultPasswordHash,
    role: 'SENIOR_MANAGER',
    department: 'Executive',
    createdAt: new Date('2026-01-01T08:00:00Z')
  }
];

const initialVendors = [
  {
    id: 'ven-techsource-1',
    name: 'TechSource Inc.',
    code: 'TECHSOURCE',
    isActive: true,
    supportedCategories: 'IT_EQUIPMENT,SOFTWARE',
    apiConfig: JSON.stringify({ endpoint: 'https://api.techsource.mock/v1/orders' })
  },
  {
    id: 'ven-officemart-1',
    name: 'OfficeMart Supplies',
    code: 'OFFICEMART',
    isActive: true,
    supportedCategories: 'OFFICE_SUPPLIES',
    apiConfig: JSON.stringify({ endpoint: 'https://api.officemart.mock/v2/items' })
  },
  {
    id: 'ven-enterprise-1',
    name: 'Enterprise Supply Co.',
    code: 'ENTERPRISE_SUPPLY',
    isActive: true,
    supportedCategories: 'TRAINING,OTHER',
    apiConfig: JSON.stringify({ endpoint: 'https://api.enterprisesupply.mock/checkout' })
  }
];

module.exports = {
  initialUsers,
  initialVendors
};

