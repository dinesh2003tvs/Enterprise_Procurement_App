import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LoadingState, ErrorState } from '../components/UIStateView';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  ShoppingCart,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react';

export const Dashboard = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingState message="Connecting to live metrics..." />;
  if (error) return <ErrorState title="Dashboard Error" message={error} onRetry={fetchStats} />;

  const statCards = [
    {
      label: 'Total Requests',
      value: stats?.total || 0,
      icon: FileText,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      borderAccent: 'border-t-blue-500',
      subtitle: 'All-time volume'
    },
    {
      label: 'Pending Approvals',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      borderAccent: 'border-t-amber-500',
      subtitle: 'Requires action'
    },
    {
      label: 'Approved Requests',
      value: stats?.approved || 0,
      icon: CheckCircle2,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      borderAccent: 'border-t-indigo-500',
      subtitle: 'Manager / Finance'
    },
    {
      label: 'Completed Orders',
      value: stats?.completed || 0,
      icon: PackageCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      borderAccent: 'border-t-emerald-500',
      subtitle: 'Paid & fulfilled'
    },
    {
      label: 'Rejected Orders',
      value: stats?.rejected || 0,
      icon: XCircle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      borderAccent: 'border-t-rose-500',
      subtitle: 'Terminated requests'
    },
    {
      label: 'Payment Failed',
      value: stats?.paymentFailed || 0,
      icon: AlertTriangle,
      color: 'text-red-400 bg-red-500/10 border-red-500/20',
      borderAccent: 'border-t-red-500',
      subtitle: 'Gateway retry needed'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/90 via-indigo-900/80 to-slate-900 border border-blue-500/30 p-6 sm:p-8 shadow-2xl shadow-blue-950/50">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-blue-200 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Active Role: <strong className="text-white">{role}</strong></span>
              <span className="text-blue-300">({user?.department} Dept)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-xl">
              Centralized purchase requests, multi-tier approval tracking, and automated vendor order dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {role === 'EMPLOYEE' && (
              <Link
                to="/requests/new"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Purchase Request</span>
              </Link>
            )}

            {role === 'MANAGER' && (
              <Link
                to="/manager-queue"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Manager Approval Queue</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            )}

            {role === 'FINANCE' && (
              <Link
                to="/finance-queue"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
              >
                <DollarSign className="w-4 h-4" />
                <span>Finance Verification Queue</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            )}

            {role === 'PROCUREMENT_ADMIN' && (
              <Link
                to="/procurement-queue"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Procurement Dashboard</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <Activity className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Platform Metrics Overview
          </h2>
          <span className="text-[11px] text-slate-500">Real-time sync</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`glass-panel p-4 rounded-2xl border-t-2 ${card.borderAccent} shadow-sm glass-card-hover flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-400 truncate pr-1">{card.label}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white tracking-tight font-display">
                    {card.value}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">
                    {card.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Employee */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-md glass-card-hover flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-1">Employee Portal</h3>
            <p className="text-xs text-slate-400 mb-4">
              Create purchase requisitions, attach business justifications, and track multi-stage progress.
            </p>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <Link
              to="/requests/new"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-blue-600/10 border border-slate-800/60 hover:border-blue-500/30 text-xs font-semibold text-slate-200 hover:text-blue-300 transition-all group"
            >
              <span>+ Create New Request</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/my-requests"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-blue-600/10 border border-slate-800/60 hover:border-blue-500/30 text-xs font-semibold text-slate-200 hover:text-blue-300 transition-all group"
            >
              <span>→ View My Requests & Status</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Approvals */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-md glass-card-hover flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-1">Approval Queues</h3>
            <p className="text-xs text-slate-400 mb-4">
              Direct review workflows for department managers and departmental finance controllers.
            </p>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <Link
              to="/manager-queue"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-purple-600/10 border border-slate-800/60 hover:border-purple-500/30 text-xs font-semibold text-slate-200 hover:text-purple-300 transition-all group"
            >
              <span>→ Manager Approval Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/finance-queue"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-emerald-600/10 border border-slate-800/60 hover:border-emerald-500/30 text-xs font-semibold text-slate-200 hover:text-emerald-300 transition-all group"
            >
              <span>→ Finance Budget Verification</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Procurement */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-md glass-card-hover flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-1">Procurement & Payments</h3>
            <p className="text-xs text-slate-400 mb-4">
              Adapter pattern vendor quotes, purchase orders, and idempotent bank transfers.
            </p>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <Link
              to="/procurement-queue"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-amber-600/10 border border-slate-800/60 hover:border-amber-500/30 text-xs font-semibold text-slate-200 hover:text-amber-300 transition-all group"
            >
              <span>→ Procurement Operations Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
