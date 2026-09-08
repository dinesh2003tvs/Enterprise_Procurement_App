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
  ShoppingCart
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

  if (loading) return <LoadingState message="Loading dashboard metrics..." />;
  if (error) return <ErrorState title="Dashboard Error" message={error} onRetry={fetchStats} />;

  const statCards = [
    { label: 'Total Requests', value: stats?.total || 0, icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Pending Approvals', value: stats?.pending || 0, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Approved Requests', value: stats?.approved || 0, icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { label: 'Completed Orders', value: stats?.completed || 0, icon: PackageCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Rejected', value: stats?.rejected || 0, icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { label: 'Payment Failed', value: stats?.paymentFailed || 0, icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
              Role: {role}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="mt-1 text-blue-100 text-sm">
              Department: <strong className="text-white">{user?.department}</strong> | Enterprise Procurement Portal
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            {role === 'EMPLOYEE' && (
              <Link
                to="/requests/new"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-semibold text-sm shadow transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Purchase Request</span>
              </Link>
            )}

            {role === 'MANAGER' && (
              <Link
                to="/manager-queue"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-purple-700 hover:bg-purple-50 rounded-xl font-semibold text-sm shadow transition-colors"
              >
                <span>Manager Approval Queue</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}

            {role === 'FINANCE' && (
              <Link
                to="/finance-queue"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl font-semibold text-sm shadow transition-colors"
              >
                <span>Finance Approval Queue</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}

            {role === 'PROCUREMENT_ADMIN' && (
              <Link
                to="/procurement-queue"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-amber-700 hover:bg-amber-50 rounded-xl font-semibold text-sm shadow transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Procurement Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 mb-2">Employee Actions</h3>
          <p className="text-xs text-slate-500 mb-4">Draft, submit, and track purchase requests in real-time.</p>
          <div className="space-y-2">
            <Link
              to="/requests/new"
              className="block p-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors"
            >
              + Create New Purchase Request
            </Link>
            <Link
              to="/my-requests"
              className="block p-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors"
            >
              → View My Requests & Status
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 mb-2">Approver Queues</h3>
          <p className="text-xs text-slate-500 mb-4">Multi-stage review for department managers and finance controllers.</p>
          <div className="space-y-2">
            <Link
              to="/manager-queue"
              className="block p-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-xs font-semibold text-slate-700 hover:text-purple-700 transition-colors"
            >
              → Manager Approval Queue
            </Link>
            <Link
              to="/finance-queue"
              className="block p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
            >
              → Finance Budget Verification Queue
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 mb-2">Procurement & Orders</h3>
          <p className="text-xs text-slate-500 mb-4">Vendor assignment, adapter quote dispatch, and idempotent payment.</p>
          <div className="space-y-2">
            <Link
              to="/procurement-queue"
              className="block p-3 rounded-xl bg-slate-50 hover:bg-amber-50 text-xs font-semibold text-slate-700 hover:text-amber-700 transition-colors"
            >
              → Procurement Operations Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

