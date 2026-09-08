import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../utils/constants';
import {
  Building2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  CheckSquare,
  DollarSign,
  ShoppingCart,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Database
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeAccount, setActiveAccount] = useState(null);
  const [error, setError] = useState(null);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'EMPLOYEE':
        return <Sparkles className="w-4 h-4 text-blue-400" />;
      case 'MANAGER':
        return <CheckSquare className="w-4 h-4 text-purple-400" />;
      case 'FINANCE':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'PROCUREMENT_ADMIN':
        return <ShoppingCart className="w-4 h-4 text-amber-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
    }
  };

  const getRoleGradient = (role) => {
    switch (role) {
      case 'EMPLOYEE':
        return 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/30 hover:border-blue-400 hover:shadow-glow-blue';
      case 'MANAGER':
        return 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/30 hover:border-purple-400 hover:shadow-glow-purple';
      case 'FINANCE':
        return 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 hover:border-emerald-400 hover:shadow-glow-emerald';
      case 'PROCUREMENT_ADMIN':
        return 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30 hover:border-amber-400 hover:shadow-glow-amber';
      default:
        return 'from-slate-500/10 to-transparent border-slate-500/30';
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoAccount) => {
    setActiveAccount(demoAccount.role);
    setEmail(demoAccount.email);
    setPassword('password123');
    setError(null);
    setLoading(true);
    try {
      await login(demoAccount.email, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check network connection.');
    } finally {
      setLoading(false);
      setActiveAccount(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-grid-pattern">
      {/* Ambient background blur circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 ambient-glow-1 rounded-full pointer-events-none filter blur-3xl opacity-70"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 ambient-glow-2 rounded-full pointer-events-none filter blur-3xl opacity-70"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ambient-glow-3 rounded-full pointer-events-none filter blur-3xl opacity-40"></div>

      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20 mb-4 transition-transform hover:scale-105 duration-300">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          ProcureFlow
        </h1>
        <p className="mt-2 text-sm text-slate-400 font-medium max-w-sm mx-auto">
          Centralized Purchase Request & Multi-Stage Approval Platform
        </p>

        {/* Live Cloud DB indicator */}
        <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <Database className="w-3 h-3 text-emerald-400" />
          <span>Live Cloud Database (Neon PostgreSQL)</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl shadow-2xl relative">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-start space-x-3 text-rose-200 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-300">Authentication Failed</p>
                <p className="text-xs text-rose-200/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* 1-Click Role Login */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-400" /> Instant Demo Role Access
              </span>
              <span className="text-[11px] text-slate-400">Click any card to sign in</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = activeAccount === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    disabled={loading}
                    className={`relative p-3.5 text-left border rounded-xl bg-gradient-to-br transition-all duration-200 group flex flex-col justify-between ${getRoleGradient(acc.role)} ${
                      isSelected ? 'ring-2 ring-blue-400 scale-[0.98]' : 'hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-md bg-white/10">
                          {getRoleIcon(acc.role)}
                        </div>
                        <span className="font-bold text-xs text-white">
                          {acc.label}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform group-hover:translate-x-1" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-200 block truncate">
                        {acc.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {acc.department} Dept
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/90 px-3 text-slate-400 font-medium tracking-wider">
                Or Sign In With Email
              </span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@company.com"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400 flex items-center space-x-1">
                <span>Default demo password:</span>
                <code className="bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded font-mono text-[10px]">
                  password123
                </code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-blue-500/40"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Signing In...</span>
                </span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
