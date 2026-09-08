import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../components/UIStateView';
import { CheckSquare, Check, X, MessageSquare, ChevronRight, UserCheck, ShieldAlert } from 'lucide-react';

export const ManagerQueue = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [selectedReq, setSelectedReq] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'APPROVE' or 'REJECT'
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPendingManager();
      setRequests(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load manager queue');
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
    setComment(action === 'APPROVE' ? 'Approved by departmental manager for operational use' : '');
  };

  const handleDecision = async () => {
    if (!comment.trim() && modalAction === 'REJECT') {
      alert('Rejection reason is mandatory.');
      return;
    }
    setActionLoading(true);
    try {
      if (modalAction === 'APPROVE') {
        await api.managerApprove(selectedReq.id, comment);
      } else {
        await api.managerReject(selectedReq.id, comment);
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
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Manager Approval Pipeline</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-13">
            Review and clear departmental purchase requisitions before automatic transmission to Finance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold px-3.5 py-1.5 bg-purple-500/10 text-purple-300 rounded-xl border border-purple-500/20 shadow-glow-purple flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>{requests.length} Pending Approval</span>
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading manager approval backlog..." />
      ) : error ? (
        <ErrorState title="Queue Error" message={error} onRetry={fetchPending} />
      ) : requests.length === 0 ? (
        <EmptyState
          title="All Clear — No Pending Approvals"
          message="No purchase requisitions are currently waiting for your departmental managerial clearance."
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Requisition ID</th>
                  <th className="py-3.5 px-5">Requester Profile</th>
                  <th className="py-3.5 px-5">Requisition Item</th>
                  <th className="py-3.5 px-5">Priority</th>
                  <th className="py-3.5 px-5">Requisition Commitment</th>
                  <th className="py-3.5 px-5 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-blue-400">
                      <Link to={`/requests/${r.id}`} className="hover:underline">
                        {r.id}
                      </Link>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-white">{r.employeeName}</div>
                      <div className="text-[11px] text-purple-300 font-medium mt-0.5">{r.department} Department</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-medium text-white">{r.itemName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {r.category} • {r.quantity} unit(s)
                      </div>
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
                    <td className="py-4 px-5 text-right space-x-2">
                      <button
                        onClick={() => openModal(r, 'APPROVE')}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all inline-flex items-center space-x-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modern Approval / Rejection Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="glass-panel rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-slate-700/80 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              modalAction === 'APPROVE' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'
            }`} />

            <h3 className="text-xl font-extrabold text-white mb-2">
              {modalAction === 'APPROVE' ? 'Approve Purchase Requisition' : 'Reject Purchase Requisition'}
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Requisition <strong className="font-mono text-blue-400">{selectedReq.id}</strong> for{' '}
              <strong className="text-white">{selectedReq.itemName}</strong> (₹{selectedReq.totalAmount.toLocaleString('en-IN')})
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Manager Justification / Feedback {modalAction === 'REJECT' && <span className="text-rose-400">*</span>}
              </label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={modalAction === 'APPROVE' ? 'Add managerial sign-off remarks...' : 'Provide specific rejection reasoning...'}
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
                {actionLoading ? 'Updating Ledger...' : modalAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

