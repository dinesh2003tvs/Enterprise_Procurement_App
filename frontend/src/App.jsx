import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateRequest } from './pages/CreateRequest';
import { MyRequests } from './pages/MyRequests';
import { RequestDetails } from './pages/RequestDetails';
import { ManagerQueue } from './pages/ManagerQueue';
import { FinanceQueue } from './pages/FinanceQueue';
import { ProcurementDashboard } from './pages/ProcurementDashboard';
import { LoadingState } from './components/UIStateView';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <LoadingState message="Verifying security session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full p-8 glass-panel rounded-2xl border border-rose-500/20 text-center shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
            <span className="text-2xl font-bold">403</span>
          </div>
          <h2 className="text-xl font-bold text-white">Unauthorized Access</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Your current role (<span className="text-rose-300 font-semibold">{role}</span>) does not have permission to view this pipeline.
          </p>
          <div className="mt-6">
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-brand-500/30 selection:text-brand-200">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-grid-pattern opacity-60 pointer-events-none -z-10" />
      <div className="fixed top-0 left-1/4 w-96 h-96 ambient-glow-1 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 ambient-glow-2 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar />
      <main className="min-h-[calc(100vh-64px)] pb-16">{children}</main>
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/new"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <CreateRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <MyRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/:id"
            element={
              <ProtectedRoute>
                <RequestDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager-queue"
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'SENIOR_MANAGER']}>
                <ManagerQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance-queue"
            element={
              <ProtectedRoute allowedRoles={['FINANCE']}>
                <FinanceQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/procurement-queue"
            element={
              <ProtectedRoute allowedRoles={['PROCUREMENT_ADMIN']}>
                <ProcurementDashboard />
              </ProtectedRoute>
            }
          />

          {/* Root Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

