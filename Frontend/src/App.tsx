import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SalesDashboard from './pages/SalesDashboard';
import ManagementDashboard from './pages/ManagementDashboard';
import SpecialistInbox from './pages/SpecialistInbox';
import RFPDetail from './pages/RFPDetail';
import AllRFPsPage from './pages/AllRFPsPage';
import SalesAgentPage from './pages/SalesAgentPage';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';

// Simple protection wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  try {
    const { role } = useAuth();
    if (!role) return <Navigate to="/login" replace />;
    return <>{children}</>;
  } catch (error) {
    console.error('ProtectedRoute error:', error);
    return <Navigate to="/login" replace />;
  }
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Routes inside the App Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<SalesDashboard />} />
        <Route path="/management" element={<ManagementDashboard />} />
        <Route path="/inbox" element={<SpecialistInbox />} />
        <Route path="/all-rfps" element={<AllRFPsPage />} />
        <Route path="/rfp/:id" element={<RFPDetail />} />
        <Route path="/sales-agent" element={<SalesAgentPage />} />
      </Route>
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
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

// Error boundary fallback
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
  });
}

export default App;
