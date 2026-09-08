import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { StatusStepper } from '../components/StatusStepper';
import { LoadingState, ErrorState } from '../components/UIStateView';
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  DollarSign,
  Tag,
  AlertTriangle,
  Clock,
  Send,
  XCircle,
  CreditCard,
  Truck,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Activity
} from 'lucide-react';

export const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRequestById(id);
      setRequest(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch request details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      await api.submitRequest(id);
      await fetchDetails();
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this purchase requisition?')) return;
    setActionLoading(true);
    try {
      await api.cancelRequest(id);
      await fetchDetails();
    } catch (err) {
      alert(err.message || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading requisition dossier..." />;
  if (error) return <ErrorState title="Error Loading Requisition" message={error} onRetry={fetchDetails} />;
  if (!request) return <ErrorState title="Not Found" message="Purchase requisition does not exist." />;

  const isOwner = user?.id === request.employeeId;
  const canSubmit = isOwner && (request.status === 'DRAFT' || request.status === 'REJECTED');
  const canCancel = isOwner && ['DRAFT', 'SUBMITTED'].includes(request.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-slate-800/80 gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors border border-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-extrabold text-white font-mono tracking-tight">{request.id}</h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registered in ledger on {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="flex items-center space-x-3">
          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center space-x-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{actionLoading ? 'Transmitting...' : 'Submit for Approval'}</span>
            </button>
          )}

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-4 py-2.5 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Requisition</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Pipeline Stepper Card */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/80 shadow-2xl mb-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Automated Procurement Pipeline</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Tier: {request.totalAmount > 100000 ? 'High-Value' : 'Standard'}</span>
        </div>
        <StatusStepper status={request.status} />
      </div>

      {/* Main Grid: Details + Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Requisition, Vendor, Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item & Financial Information */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
            <h3 className="font-extrabold text-base text-white mb-6 pb-4 border-b border-slate-800/80">
              Requisition Specifications & Commitment
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Item Specification</span>
                <span className="font-bold text-white text-sm mt-1 block">{request.itemName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Category</span>
                <span className="font-semibold text-slate-200 mt-1 block">{request.category}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Priority</span>
                <span className="font-semibold text-slate-200 mt-1 block">{request.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Requested Quantity</span>
                <span className="font-semibold text-slate-200 mt-1 block">{request.quantity} units</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Unit Rate</span>
                <span className="font-semibold text-slate-200 mt-1 block">₹{request.unitPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Total Requisition Commitment</span>
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 text-base mt-1 block">
                  ₹{request.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium block mb-2 uppercase tracking-wider text-[11px]">Business Justification</span>
              <p className="text-slate-300 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 leading-relaxed text-xs">
                {request.businessJustification}
              </p>
            </div>
          </div>

          {/* Approvals History */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
            <h3 className="font-extrabold text-base text-white mb-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
              <span>Recorded Governance Decisions</span>
              <span className="text-xs font-normal text-slate-400">
                {request.approvals?.length || 0} stage sign-off(s)
              </span>
            </h3>

            {(!request.approvals || request.approvals.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No formal approval reviews have been signed off yet.</p>
            ) : (
              <div className="space-y-3.5">
                {request.approvals.map((appr) => (
                  <div
                    key={appr.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-start justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <span className="font-bold text-white">{appr.approverName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {appr.role}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          appr.action === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}>
                          {appr.action}
                        </span>
                      </div>
                      <p className="mt-2 text-slate-300 italic text-xs">"{appr.comment || 'Approved without additional commentary'}"</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(appr.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vendor & Payment Cards */}
          {(request.selectedVendorName || request.payment) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {request.selectedVendorName && (
                <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs mb-3">
                    <Truck className="w-4 h-4" />
                    <span>Allocated Vendor Fulfillment</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5">
                    <div><span className="text-slate-500">Vendor:</span> <strong className="text-white ml-1">{request.selectedVendorName}</strong></div>
                    <div><span className="text-slate-500">Quote ID:</span> <span className="font-mono text-cyan-300 ml-1">{request.vendorQuote?.quoteId || 'N/A'}</span></div>
                    <div><span className="text-slate-500">SLA Window:</span> <span className="text-emerald-300 font-semibold ml-1">{request.vendorQuote?.deliveryDays || 5} days</span></div>
                  </div>
                </div>
              )}

              {request.payment && (
                <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-xl">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs mb-3">
                    <CreditCard className="w-4 h-4" />
                    <span>Settlement Settlement Ledger</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5">
                    <div><span className="text-slate-500">Method:</span> <span className="text-white font-semibold ml-1">{request.payment.method}</span></div>
                    <div><span className="text-slate-500">Txn Ref:</span> <span className="font-mono text-emerald-300 ml-1">{request.payment.transactionId}</span></div>
                    <div><span className="text-slate-500">Settled:</span> <span className="text-white font-bold ml-1">₹{request.payment.amount?.toLocaleString('en-IN')}</span></div>
                    <div><span className="text-slate-500">Status:</span> <span className="text-emerald-400 font-bold ml-1">{request.payment.status}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Employee Info + Audit Trail */}
        <div className="space-y-6">
          {/* Requester Information */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/80 shadow-xl">
            <h3 className="font-extrabold text-sm text-white mb-4 pb-3 border-b border-slate-800/80">
              Requester Profile
            </h3>
            <div className="text-xs space-y-3">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Employee Name</span>
                <span className="font-bold text-white mt-0.5 block">{request.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Department</span>
                <span className="font-semibold text-slate-300 mt-0.5 block">{request.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Enterprise Email</span>
                <span className="font-mono text-blue-400 mt-0.5 block">{request.employeeEmail}</span>
              </div>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800/80 shadow-xl">
            <h3 className="font-extrabold text-sm text-white mb-5 pb-3 border-b border-slate-800/80 flex items-center justify-between">
              <span>Audit Ledger (Phase 2 §14)</span>
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </h3>

            {(!request.auditLogs || request.auditLogs.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No audit records logged yet.</p>
            ) : (
              <div className="relative pl-5 border-l-2 border-slate-800 space-y-5 text-xs">
                {request.auditLogs.map((log) => (
                  <div key={log.id} className="relative group">
                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-950 shadow-glow-blue" />
                    <div className="font-bold text-white">{log.action}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      by <span className="text-slate-300 font-medium">{log.performedBy}</span> • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {log.comment && (
                      <p className="text-[11px] text-slate-400 mt-1 italic bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                        "{log.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

