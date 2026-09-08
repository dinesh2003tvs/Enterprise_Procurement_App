import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, EmptyState, ErrorState } from '../components/UIStateView';
import { ShoppingCart, Truck, CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Cpu, Layers } from 'lucide-react';

export const ProcurementDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeModal, setActiveModal] = useState(null);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Procurement Operations Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 pl-13">
            Orchestrate multi-vendor procurement adapters, generate dynamic quotes, and settle idempotent bank transfers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold px-3.5 py-1.5 bg-cyan-500/10 text-cyan-300 rounded-xl border border-cyan-500/20 shadow-glow-cyan flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{requests.length} Orders in Pipeline</span>
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Connecting to vendor procurement hub..." />
      ) : error ? (
        <ErrorState title="Procurement Hub Error" message={error} onRetry={fetchQueue} />
      ) : requests.length === 0 ? (
        <EmptyState
          title="Procurement Orders Up to Date"
          message="No purchase requisitions are currently waiting for vendor allocation or payment dispatch."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((r) => {
            const hasVendor = !!r.selectedVendorName;
            const isReadyForPayment = r.status === 'PROCUREMENT_STARTED' || r.status === 'PAYMENT_FAILED';

            return (
              <div
                key={r.id}
                className="glass-panel rounded-3xl border border-slate-800/80 p-6 sm:p-7 shadow-2xl flex flex-col justify-between hover:border-cyan-500/30 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono font-bold text-sm text-blue-400">{r.id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <span className="text-lg font-extrabold text-white">
                      ₹{r.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base tracking-tight">{r.itemName}</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    {r.category} • {r.quantity} unit(s) requested by <span className="text-slate-300 font-semibold">{r.employeeName}</span> ({r.department})
                  </div>

                  {/* Vendor Recommendation & Status Card */}
                  <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="inline-flex items-center space-x-1">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Procurement Adapter:</span>
                      </span>
                      <span className="text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[11px]">
                        TechSource Adapter Engine
                      </span>
                    </div>

                    {hasVendor ? (
                      <>
                        <div className="flex justify-between items-center text-slate-400 pt-1">
                          <span>Assigned Vendor:</span>
                          <strong className="text-white font-bold">{r.selectedVendorName}</strong>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Quotation Reference:</span>
                          <span className="font-mono text-cyan-300">{r.vendorQuote?.quoteId || 'TS-QUOTE-ACTIVE'}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Guaranteed SLA Delivery:</span>
                          <span className="text-emerald-300 font-semibold">{r.vendorQuote?.deliveryDays || 5} business days</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-500 italic pt-1 text-[11px]">
                        Pending automated quotation dispatch to preferred vendor network...
                      </div>
                    )}
                  </div>
                </div>

                {/* Procurement Action Footer */}
                <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    to={`/requests/${r.id}`}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    View Audit Trail →
                  </Link>

                  <div className="flex items-center space-x-2">
                    {!hasVendor ? (
                      <button
                        onClick={() => handleSelectVendor(r)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 transition-all"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Select TechSource & Quote</span>
                      </button>
                    ) : isReadyForPayment ? (
                      <button
                        onClick={() => handleExecutePayment(r)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Disburse Payment (Idempotent)</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Order Completed & Settled</span>
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

