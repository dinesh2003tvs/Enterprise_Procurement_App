import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../utils/constants';
import {
  Building2,
  LayoutDashboard,
  PlusCircle,
  FileText,
  CheckSquare,
  DollarSign,
  ShoppingCart,
  LogOut,
  UserCheck
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout, login } = useAuth();
  const location = useLocation();

  const handleRoleSwitch = async (account) => {
    try {
      await login(account.email, 'password123');
    } catch (e) {
      console.error('Failed to switch role', e);
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['EMPLOYEE', 'MANAGER', 'FINANCE', 'PROCUREMENT_ADMIN', 'SENIOR_MANAGER'] },
    { to: '/requests/new', label: 'Create Request', icon: PlusCircle, roles: ['EMPLOYEE'] },
    { to: '/my-requests', label: 'My Requests', icon: FileText, roles: ['EMPLOYEE'] },
    { to: '/manager-queue', label: 'Manager Queue', icon: CheckSquare, roles: ['MANAGER', 'SENIOR_MANAGER'] },
    { to: '/finance-queue', label: 'Finance Queue', icon: DollarSign, roles: ['FINANCE'] },
    { to: '/procurement-queue', label: 'Procurement Queue', icon: ShoppingCart, roles: ['PROCUREMENT_ADMIN'] },
  ];

  const visibleLinks = navLinks.filter(link => !link.roles || link.roles.includes(role));

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <Link to="/dashboard" className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                ProcureFlow
              </Link>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Enterprise Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {visibleLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Quick Role Switcher + User Info */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Switcher */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 px-2 font-medium flex items-center">
                <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-400" /> Switch:
              </span>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => handleRoleSwitch(acc)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    role === acc.role
                      ? 'bg-white font-bold text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>

            {/* Current User Pill */}
            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                  <div className="text-[10px] text-slate-500">{user.role} ({user.department})</div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
