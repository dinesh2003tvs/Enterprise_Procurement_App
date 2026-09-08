import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../components/UIStateView';
import { CheckSquare, Check, X, MessageSquare, ChevronRight } from 'lucide-react';

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
    setComment(action === 'APPROVE' ? 'Approved by departmental manager' : '');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Manager Approval Queue</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review and approve departmental purchase requests before financial validation
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
          {requests.length} Pending
        </span>
      </div>

      {loading ? (
        <LoadingState message="Loading manager approval queue..." />
      ) : error ? (
        <ErrorState title="Queue Error" message={error} onRetry={fetchPending} />
      ) : requests.length === 0 ? (
        <EmptyState
          title="Manager Queue Clear"
          message="No purchase requests are currently waiting for your approval."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Item & Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">
                      <Link to={`/requests/${r.id}`} className="hover:underline">
                        {r.id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{r.employeeName}</div>
                      <div className="text-[10px] text-slate-400">{r.department}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{r.itemName}</div>
                      <div className="text-[10px] text-slate-400">{r.category} ({r.quantity} units)</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">{r.priority}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{r.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openModal(r, 'APPROVE')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors inline-flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => openModal(r, 'REJECT')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg font-semibold text-xs transition-colors inline-flex items-center space-x-1"
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

      {/* Approval / Rejection Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {modalAction === 'APPROVE' ? 'Approve Purchase Request' : 'Reject Purchase Request'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Request <strong className="font-mono text-slate-800">{selectedReq.id}</strong> for{' '}
              <strong className="text-slate-800">{selectedReq.itemName}</strong> (₹{selectedReq.totalAmount.toLocaleString('en-IN')})
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Approval Comment / Feedback {modalAction === 'REJECT' && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows="3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={modalAction === 'APPROVE' ? 'Add any approval remarks...' : 'Provide specific rejection reason...'}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDecision}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs ${
                  modalAction === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Processing...' : modalAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
