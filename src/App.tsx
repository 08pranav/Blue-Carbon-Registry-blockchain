import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RoleAuthProvider, useRoleAuth } from "./contexts/RoleAuthContext";
import { BlockchainProvider } from "./contexts/BlockchainContext";
import SimpleHeader from "./components/SimpleHeader";
import SimpleHome from "./pages/SimpleHome";
import Login from "./pages/Login";
import NGODashboard from "./pages/NGODashboard";
import AuditorDashboard from "./pages/AuditorDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import AuthDemo from "./pages/AuthDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Dashboard Router Component - Routes users to correct dashboard based on role
const DashboardRouter = () => {
  const { authState } = useRoleAuth();
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  switch (authState.role) {
    case 'NGO':
      return <NGODashboard />;
    case 'AUDITOR':
      return <AuditorDashboard />;
    case 'COMPANY':
      return <CompanyDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useRoleAuth();
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Main App Routes
const AppRoutes = () => {
  const { authState } = useRoleAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<SimpleHome />} />
      <Route path="/auth-demo" element={<AuthDemo />} />
      <Route path="/login" element={<Login />} />
      
      {/* Dashboard Route - Automatically routes to correct role dashboard */}
      <Route path="/dashboard" element={<DashboardRouter />} />
      
      {/* Role-specific Routes */}
      <Route path="/ngo" element={
        <ProtectedRoute>
          {authState.role === 'NGO' ? <NGODashboard /> : <Navigate to="/dashboard" replace />}
        </ProtectedRoute>
      } />
      
      <Route path="/auditor" element={
        <ProtectedRoute>
          {authState.role === 'AUDITOR' ? <AuditorDashboard /> : <Navigate to="/dashboard" replace />}
        </ProtectedRoute>
      } />
      
      <Route path="/company" element={
        <ProtectedRoute>
          {authState.role === 'COMPANY' ? <CompanyDashboard /> : <Navigate to="/dashboard" replace />}
        </ProtectedRoute>
      } />
      
      {/* Fallback Routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleAuthProvider>
        <BlockchainProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-background">
              <SimpleHeader />
              <AppRoutes />
            </div>
          </BrowserRouter>
        </BlockchainProvider>
      </RoleAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;