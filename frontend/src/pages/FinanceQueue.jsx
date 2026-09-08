import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../components/UIStateView';
import { DollarSign, Check, X, ShieldAlert, Sparkles, PieChart, Wallet } from 'lucide-react';

export const FinanceQueue = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Department Budgets (Phase 2 §7 & §31)
  const [departmentBudgets] = useState({
    Engineering: 500000,
    Finance: 300000,
    Procurement: 250000,
    Executive: 1000000
  });

  // Modal State
  const [selectedReq, setSelectedReq] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'APPROVE' or 'REJECT'
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPendingFinance();
      setRequests(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load finance queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openModal = (req, action) => {
    setSelectedReq(req);
    setModalAction(action);
    setComment(action === 'APPROVE' ? 'Departmental fiscal allocation verified and reserved' : '');
  };

  const handleDecision = async () => {
    if (!comment.trim() && modalAction === 'REJECT') {
      alert('Rejection reason is mandatory.');
      return;
    }
    setActionLoading(true);
    try {
      if (modalAction === 'APPROVE') {
        await api.financeApprove(selectedReq.id, comment);
      } else {
        await api.financeReject(selectedReq.id, comment);
      }
      setSelectedReq(null);
      await fetchPending();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Finance Budget Clearance</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-13">
            Validate departmental pool limits, enforce fiscal compliance, and release purchase requisitions for procurement
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold px-3.5 py-1.5 bg-emerald-500/10 text-emerald-300 rounded-xl border border-emerald-500/20 shadow-glow-emerald flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{requests.length} Pending Clearance</span>
          </span>
        </div>
      </div>

      {/* Department Budget Pool Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {Object.entries(departmentBudgets).map(([dept, budget]) => (
          <div key={dept} className="glass-panel p-4 rounded-2xl border border-slate-800/80 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold">{dept}</span>
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-extrabold text-white">₹{budget.toLocaleString('en-IN')}</div>
            <div className="text-[10px] text-emerald-400 mt-1">Authorized Fiscal Pool</div>
          </div>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Connecting to fiscal clearance ledger..." />
      ) : error ? (
        <ErrorState title="Finance Queue Error" message={error} onRetry={fetchPending} />
      ) : requests.length === 0 ? (
        <EmptyState
          title="Finance Pipeline Clear"
          message="No purchase requisitions are currently awaiting fiscal budget authorization."
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Requisition ID</th>
                  <th className="py-3.5 px-5">Department & Owner</th>
                  <th className="py-3.5 px-5">Item & Category</th>
                  <th className="py-3.5 px-5">Requisition Amount</th>
                  <th className="py-3.5 px-5">Department Pool</th>
                  <th className="py-3.5 px-5">Remaining Balance</th>
                  <th className="py-3.5 px-5 text-right">Fiscal Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((r) => {
                  const available = departmentBudgets[r.department] || 300000;
                  const remaining = available - r.totalAmount;
                  const isSufficient = remaining >= 0;

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-blue-400">
                        <Link to={`/requests/${r.id}`} className="hover:underline">
                          {r.id}
                        </Link>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{r.department}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{r.employeeName}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-medium text-white">{r.itemName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{r.category}</div>
                      </td>
                      <td className="py-4 px-5 font-bold text-white text-sm">
                        ₹{r.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 text-emerald-400 font-semibold">
                        ₹{available.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 font-bold">
                        <span className={isSufficient ? 'text-emerald-300' : 'text-rose-400'}>
                          ₹{remaining.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <button
                          onClick={() => openModal(r, 'APPROVE')}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all inline-flex items-center space-x-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Clear Budget</span>
                        </button>
                        <button
                          onClick={() => openModal(r, 'REJECT')}
                          className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl font-bold text-xs transition-all inline-flex items-center space-x-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modern Finance Decision Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-slate-700/80 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              modalAction === 'APPROVE' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'
            }`} />

            <h3 className="text-xl font-extrabold text-white mb-2">
              {modalAction === 'APPROVE' ? 'Authorize Departmental Fiscal Budget' : 'Reject Requisition on Fiscal Grounds'}
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Allocate funds for requisition <strong className="font-mono text-blue-400">{selectedReq.id}</strong> in department <strong className="text-white">{selectedReq.department}</strong>
            </p>

            {/* Live deduction widget */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-xs mb-5 space-y-2 text-slate-300 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Department Pool:</span>
                <span className="font-bold text-white">₹{departmentBudgets[selectedReq.department]?.toLocaleString('en-IN') || '3,00,000'}</span>
              </div>
              <div className="flex justify-between items-center text-rose-300">
                <span>Deduction Commitment:</span>
                <span className="font-bold">- ₹{selectedReq.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-emerald-400 font-extrabold text-sm">
                <span>Remaining Pool Balance:</span>
                <span>₹{((departmentBudgets[selectedReq.department] || 300000) - selectedReq.totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Finance Verification Remarks {modalAction === 'REJECT' && <span className="text-rose-400">*</span>}
              </label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Finance justification remarks and cost-center allocation..."
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500/50 outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2.5 border border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDecision}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                  modalAction === 'APPROVE'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 shadow-rose-600/30'
                }`}
              >
                {actionLoading ? 'Allocating Funds...' : modalAction === 'APPROVE' ? 'Confirm Allocation' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

