import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Authenticated layout & pages
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/Overview';
import Transfer from './pages/Transfer';
import Statements from './pages/Statements';
import Beneficiaries from './pages/Beneficiaries';
import FixedDeposits from './pages/FixedDeposits';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard Routes (nested under layout) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="transfer" element={<Transfer />} />
        <Route path="statements" element={<Statements />} />
        <Route path="beneficiaries" element={<Beneficiaries />} />
        <Route path="fixed-deposits" element={<FixedDeposits />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
