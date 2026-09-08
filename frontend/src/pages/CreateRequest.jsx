import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import { FilePlus, Calculator, ArrowLeft, Send, Save, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

export const CreateRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'IT_EQUIPMENT',
    quantity: 1,
    unitPrice: '',
    priority: 'MEDIUM',
    businessJustification: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalAmount = Number(formData.quantity || 0) * Number(formData.unitPrice || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (shouldSubmitImmediately = false) => {
    setError(null);
    if (!formData.itemName.trim()) {
      setError('Item Name is required');
      return;
    }
    if (Number(formData.quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (Number(formData.unitPrice) <= 0) {
      setError('Unit Price must be greater than 0');
      return;
    }
    if (!formData.businessJustification.trim()) {
      setError('Business Justification is required');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Draft
      const res = await api.createDraft({
        ...formData,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice)
      });
      const createdRequest = res.data;

      // 2. Submit immediately if requested
      if (shouldSubmitImmediately) {
        await api.submitRequest(createdRequest.id);
      }

      navigate(`/requests/${createdRequest.id}`);
    } catch (err) {
      setError(err.message || 'Failed to save purchase request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb & Metadata */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Requests</span>
        </button>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Auto-Routing State Machine</span>
        </div>
      </div>

      {/* Main Glassmorphic Form Card */}
      <div className="glass-panel rounded-3xl border border-slate-800/80 shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle decorative gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

        {/* Form Header */}
        <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Purchase Request</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Initiate a procurement requisition with automated department manager and finance routing
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start space-x-3 text-rose-200 text-sm shadow-glow-rose">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-white text-xs">Validation Alert</span>
              <span className="text-xs text-rose-300">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Item or Service Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="itemName"
              required
              value={formData.itemName}
              onChange={handleChange}
              placeholder="e.g. Apple MacBook Pro 16 M3 Max or AWS Cloud Reserved Instances"
              className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Requisition Category <span className="text-rose-400">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Priority Level <span className="text-rose-400">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
              >
                {PRIORITIES.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Unit Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Quantity <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Estimated Unit Price (₹) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-semibold text-sm">₹</span>
                <input
                  type="number"
                  name="unitPrice"
                  min="1"
                  required
                  value={formData.unitPrice}
                  onChange={handleChange}
                  placeholder="25000"
                  className="w-full pl-8 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Calculated Total Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg shadow-blue-500/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Calculated Total Commitment</span>
                <span className="text-[11px] text-slate-500">
                  {formData.quantity || 0} unit(s) × ₹{Number(formData.unitPrice || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
                ₹{totalAmount.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {totalAmount > 100000 ? 'High-Value Tier: Routed to Manager & Finance' : 'Standard Tier: Direct Flow'}
              </span>
            </div>
          </div>

          {/* Business Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Business Justification <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="businessJustification"
              rows="4"
              required
              value={formData.businessJustification}
              onChange={handleChange}
              placeholder="Explain why this procurement is needed, the project or deliverable impacted, and the ROI for the organization..."
              className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4 text-slate-400" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting Requisition...' : 'Submit Requisition Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

