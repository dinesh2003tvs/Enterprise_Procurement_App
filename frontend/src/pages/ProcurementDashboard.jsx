import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../components/UIStateView';
import { ShoppingCart, Truck, CreditCard, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const ProcurementDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeModal, setActiveModal] = useState(null); // { type: 'VENDOR' | 'PAYMENT', req: ... }
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPendingProcurement();
      setRequests(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load procurement queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleSelectVendor = async (req) => {
    setActionLoading(true);
    try {
      await api.selectVendor(req.id, 'TECHSOURCE');
      setActiveModal(null);
      await fetchQueue();
    } catch (err) {
      alert(err.message || 'Vendor selection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecutePayment = async (req) => {
    setActionLoading(true);
    try {
      const idempotencyKey = `PROCUREMENT-${req.id}`;
      const res = await api.processPayment(req.id, 'BANK_TRANSFER', idempotencyKey);
      if (res.data.idempotentReplay) {
        alert(`Duplicate prevention active: Existing transaction ${res.data.transaction.transactionId} was returned.`);
      }
      setActiveModal(null);
      await fetchQueue();
    } catch (err) {
      alert(err.message || 'Payment execution failed');
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
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Procurement Operations Dashboard</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Vendor allocation via Adapters & idempotent payment settlement (Phase 2 §32)
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200">
          {requests.length} Orders Active
        </span>
      </div>

      {loading ? (
        <LoadingState message="Loading procurement orders..." />
      ) : error ? (
        <ErrorState title="Procurement Error" message={error} onRetry={fetchQueue} />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No Active Orders"
          message="No purchase requests are currently pending vendor assignment or payment."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((r) => {
            const hasVendor = !!r.selectedVendorName;
            const isReadyForPayment = r.status === 'PROCUREMENT_STARTED' || r.status === 'PAYMENT_FAILED';

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm text-blue-600">{r.id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{r.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm">{r.itemName}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {r.category} • {r.quantity} units requested by {r.employeeName} ({r.department})
                  </div>

                  {/* Vendor Recommendation & Status Card */}
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Recommended Vendor:</span>
                      <strong className="text-slate-800 font-semibold">TechSource Inc. (Adapter Pattern)</strong>
                    </div>

                    {hasVendor ? (
                      <>
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Assigned Vendor:</span>
                          <strong className="text-cyan-700 font-bold">{r.selectedVendorName}</strong>
                        </div>
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Quotation Reference:</span>
                          <span className="font-mono">{r.vendorQuote?.quoteId || 'TS-QUOTE-ACTIVE'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Delivery Timeline:</span>
                          <span>{r.vendorQuote?.deliveryDays || 5} business days</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400 italic pt-1">
                        Awaiting vendor quote and order dispatch
                      </div>
                    )}
                  </div>
                </div>

                {/* Procurement Action Area */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/requests/${r.id}`}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    View Audit Trail
                  </Link>

                  <div className="flex items-center space-x-2">
                    {!hasVendor ? (
                      <button
                        onClick={() => handleSelectVendor(r)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Select TechSource & Quote</span>
                      </button>
                    ) : isReadyForPayment ? (
                      <button
                        onClick={() => handleExecutePayment(r)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Simulate Bank Transfer (Pay)</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Order Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
