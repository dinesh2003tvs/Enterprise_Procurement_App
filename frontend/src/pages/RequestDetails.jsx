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
  FileCheck
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
    if (!window.confirm('Are you sure you want to cancel this purchase request?')) return;
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

  if (loading) return <LoadingState message="Loading request details..." />;
  if (error) return <ErrorState title="Error Loading Request" message={error} onRetry={fetchDetails} />;
  if (!request) return <ErrorState title="Not Found" message="Purchase request does not exist." />;

  const isOwner = user?.id === request.employeeId;
  const canSubmit = isOwner && (request.status === 'DRAFT' || request.status === 'REJECTED');
  const canCancel = isOwner && ['DRAFT', 'SUBMITTED'].includes(request.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 font-mono">{request.id}</h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Created on {new Date(request.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Approval</span>
            </button>
          )}

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-3.5 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Stepper */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Request Lifecycle</h3>
        <StatusStepper status={request.status} />
      </div>

      {/* Main Grid: Details + Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Request, Vendor, Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item & Financial Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Item & Financial Specification
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Item Name</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{request.itemName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Category</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{request.category}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Priority</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{request.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Quantity</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{request.quantity} units</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Estimated Unit Price</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">₹{request.unitPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Total Estimated Amount</span>
                <span className="font-bold text-blue-600 text-sm mt-0.5 block">₹{request.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-medium block mb-1">Business Justification</span>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                {request.businessJustification}
              </p>
            </div>
          </div>

          {/* Approvals History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Approval Decisions</span>
              <span className="text-xs font-normal text-slate-400">
                {request.approvals?.length || 0} decision(s) recorded
              </span>
            </h3>

            {(!request.approvals || request.approvals.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No approval decisions have been recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {request.approvals.map((appr) => (
                  <div
                    key={appr.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800">{appr.approverName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          {appr.role}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          appr.action === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {appr.action}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 italic">"{appr.comment || 'No comment provided'}"</p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(appr.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vendor & Payment Cards (if initiated) */}
          {(request.selectedVendorName || request.payment) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {request.selectedVendorName && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center space-x-2 text-cyan-700 font-bold text-xs mb-2">
                    <Truck className="w-4 h-4" />
                    <span>Vendor Assignment</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong>Vendor:</strong> {request.selectedVendorName}</div>
                    <div><strong>Quote ID:</strong> {request.vendorQuote?.quoteId || 'N/A'}</div>
                    <div><strong>Delivery Est:</strong> {request.vendorQuote?.deliveryDays || 5} days</div>
                  </div>
                </div>
              )}

              {request.payment && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs mb-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Payment Confirmation</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div><strong>Method:</strong> {request.payment.method}</div>
                    <div><strong>Txn ID:</strong> <span className="font-mono">{request.payment.transactionId}</span></div>
                    <div><strong>Amount:</strong> ₹{request.payment.amount?.toLocaleString('en-IN')}</div>
                    <div><strong>Status:</strong> <span className="text-emerald-700 font-bold">{request.payment.status}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Employee Info + Audit Trail */}
        <div className="space-y-6">
          {/* Requester Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Requester Information
            </h3>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-400 block font-medium">Employee Name</span>
                <span className="font-semibold text-slate-800">{request.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-800">{request.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Contact Email</span>
                <span className="font-semibold text-slate-800">{request.employeeEmail}</span>
              </div>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Audit Trail (Phase 2 §14)</span>
              <FileCheck className="w-4 h-4 text-slate-400" />
            </h3>

            {(!request.auditLogs || request.auditLogs.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No audit records found.</p>
            ) : (
              <div className="relative pl-4 border-l-2 border-slate-100 space-y-4 text-xs">
                {request.auditLogs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="font-semibold text-slate-800">{log.action}</div>
                    <div className="text-[10px] text-slate-400">
                      by {log.performedBy} • {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    {log.comment && (
                      <p className="text-[11px] text-slate-500 mt-0.5 italic">"{log.comment}"</p>
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
