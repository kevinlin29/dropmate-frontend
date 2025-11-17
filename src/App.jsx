import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DriverDashboard from "./pages/DriverDashboard";
import DriverRegistration from "./pages/DriverRegistration";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner">⟳</div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleBasedRoute({ children, requireRole }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner">⟳</div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and user doesn't have it, redirect appropriately
  if (requireRole && user?.role !== requireRole) {
    if (requireRole === "driver") {
      return <Navigate to="/" replace />;
    } else if (requireRole === "customer") {
      return <Navigate to="/driver" replace />;
    }
  }

  return children;
}

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();

  return (
    <div className="app">
      {isAuthenticated && <Header />}

      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Root route - redirect based on user role */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {!loading && user?.role === "driver" ? (
                <Navigate to="/driver" replace />
              ) : (
                <Dashboard />
              )}
            </ProtectedRoute>
          }
        />

        {/* Driver routes */}
        <Route
          path="/driver"
          element={
            <RoleBasedRoute requireRole="driver">
              <DriverDashboard />
            </RoleBasedRoute>
          }
        />

        {/* Driver registration */}
        <Route
          path="/register-driver"
          element={
            <ProtectedRoute>
              <DriverRegistration />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
