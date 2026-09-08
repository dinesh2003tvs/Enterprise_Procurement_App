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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Verifying session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border border-rose-200 text-center shadow-xs">
        <h2 className="text-xl font-bold text-rose-800">403 — Unauthorized Access</h2>
        <p className="text-xs text-slate-500 mt-2">
          Your current role (<strong>{role}</strong>) does not have permission to view this view.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-64px)] pb-12">{children}</main>
    </>
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
