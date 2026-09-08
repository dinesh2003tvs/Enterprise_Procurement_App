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
  UserCheck,
  Sparkles
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

  const getRoleBadgeStyle = (userRole) => {
    switch (userRole) {
      case 'EMPLOYEE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'MANAGER':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'FINANCE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'PROCUREMENT_ADMIN':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/80 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white block leading-tight font-display">
                  ProcureFlow
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Enterprise Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5">
            {visibleLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Quick Role Switcher + User Info */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Switcher */}
            <div className="hidden lg:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 px-2 font-medium flex items-center text-[11px]">
                <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-500" /> Switch:
              </span>
              {DEMO_ACCOUNTS.map((acc) => {
                const isActive = role === acc.role;
                return (
                  <button
                    key={acc.role}
                    onClick={() => handleRoleSwitch(acc)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    {acc.label}
                  </button>
                );
              })}
            </div>

            {/* Current User Pill */}
            {user && (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white">{user.name}</div>
                  <div className="flex items-center justify-end space-x-1 mt-0.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider border ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                    <span className="text-[10px] text-slate-400">({user.department})</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
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
