import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import { FilePlus, Calculator, ArrowLeft, Send, Save, AlertCircle } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <span className="text-xs text-slate-400 font-medium">Phase 2 — Functional Spec §27</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <FilePlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Create Purchase Request</h1>
            <p className="text-xs text-slate-500">Provide details for organizational procurement and approval</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="itemName"
              required
              value={formData.itemName}
              onChange={handleChange}
              placeholder="e.g. Dell UltraSharp 27-inch Monitor"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority <span className="text-rose-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {PRIORITIES.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Unit Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Unit Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="unitPrice"
                min="1"
                required
                value={formData.unitPrice}
                onChange={handleChange}
                placeholder="25000"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Auto-Calculated Total Estimated Amount */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-600 text-xs font-medium">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Calculated Total Estimated Amount:</span>
            </div>
            <div className="text-lg font-bold text-slate-900">
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Business Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="businessJustification"
              rows="3"
              required
              value={formData.businessJustification}
              onChange={handleChange}
              placeholder="Explain the necessity of this purchase and project alignment..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Approval</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
