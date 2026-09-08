import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../components/UIStateView';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import { Search, Filter, PlusCircle, ArrowUpDown, ChevronRight, FileText, Sparkles } from 'lucide-react';

export const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc');

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMyRequests();
      setRequests(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch purchase requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter & Sort Logic
  const filtered = requests.filter(r => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'amount-desc') return b.totalAmount - a.totalAmount;
    if (sortBy === 'amount-asc') return a.totalAmount - b.totalAmount;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">My Purchase Requisitions</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-13">
            Track requisition lifecycles, monitor approvals, and review real-time budget clearance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Link
            to="/requests/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Requisition</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-xl mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Requisition ID or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-brand-500/50 outline-none"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
            <option value="DRAFT" className="bg-slate-900 text-white">Draft</option>
            <option value="SUBMITTED" className="bg-slate-900 text-white">Submitted</option>
            <option value="MANAGER_APPROVED" className="bg-slate-900 text-white">Manager Approved</option>
            <option value="FINANCE_APPROVED" className="bg-slate-900 text-white">Finance Validated</option>
            <option value="PROCUREMENT_STARTED" className="bg-slate-900 text-white">Procurement Started</option>
            <option value="COMPLETED" className="bg-slate-900 text-white">Completed</option>
            <option value="REJECTED" className="bg-slate-900 text-white">Rejected</option>
            <option value="CANCELLED" className="bg-slate-900 text-white">Cancelled</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-brand-500/50 outline-none"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.label}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-brand-500/50 outline-none"
          >
            <option value="date-desc" className="bg-slate-900 text-white">Newest First</option>
            <option value="date-asc" className="bg-slate-900 text-white">Oldest First</option>
            <option value="amount-desc" className="bg-slate-900 text-white">Highest Commitment</option>
            <option value="amount-asc" className="bg-slate-900 text-white">Lowest Commitment</option>
          </select>
        </div>
      </div>

      {/* Content Table / UI States */}
      {loading ? (
        <LoadingState message="Fetching your requisitions from cloud ledger..." />
      ) : error ? (
        <ErrorState title="Requisition Error" message={error} onRetry={fetchRequests} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No requisitions found"
          message="No purchase requisitions match your search filters or you have not submitted any yet."
          action={
            <Link
              to="/requests/new"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Requisition</span>
            </Link>
          }
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Requisition ID</th>
                  <th className="py-3.5 px-5">Item Specification</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Priority</th>
                  <th className="py-3.5 px-5">Total Commitment</th>
                  <th className="py-3.5 px-5">Status Pipeline</th>
                  <th className="py-3.5 px-5">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-4 px-5 font-mono font-bold text-blue-400 group-hover:text-blue-300">
                      <Link to={`/requests/${r.id}`} className="hover:underline flex items-center space-x-1">
                        <span>{r.id}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-5 font-medium text-white max-w-xs truncate">
                      {r.itemName}
                      <span className="block text-[11px] text-slate-400 font-normal mt-0.5">
                        Qty: {r.quantity} unit(s)
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px]">
                        {r.category}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.priority === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
                        r.priority === 'HIGH' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                        'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-white text-sm">
                      ₹{r.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-4 px-5 text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/requests/${r.id}`}
                        className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 text-blue-400 hover:text-white font-semibold text-xs transition-colors"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Showing <strong>{filtered.length}</strong> of <strong>{requests.length}</strong> requisitions</span>
            <span className="text-[11px] text-slate-500">Live Postgres Ledger</span>
          </div>
        </div>
      )}
    </div>
  );
};

