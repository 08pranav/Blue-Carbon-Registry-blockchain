import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

console.log('🚀 App.tsx loading...');

// Simple fallback component
const SimpleFallback = () => (
  <div style={{ padding: '20px', background: 'red', color: 'white', minHeight: '100vh' }}>
    <h1>🚨 ERROR DETECTED</h1>
    <p>There was an error loading the main application.</p>
    <p>Check the console for details.</p>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'red', color: 'white', minHeight: '100vh' }}>
          <h1>🚨 REACT ERROR</h1>
          <p>Error: {this.state.error?.message}</p>
          <pre style={{ background: 'black', padding: '10px', marginTop: '10px' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient();

// Simple test component
const TestHome = () => {
  console.log('✅ TestHome component rendering');
  return (
    <div style={{ padding: '20px', background: 'lightblue', minHeight: '100vh' }}>
      <h1 style={{ color: 'darkblue', fontSize: '32px' }}>🌊 Blue Carbon System - DEBUG MODE</h1>
      <div style={{ marginTop: '20px', background: 'white', padding: '15px', borderRadius: '8px' }}>
        <h2>Debug Status:</h2>
        <p>✅ React working</p>
        <p>✅ Components rendering</p>
        <p>✅ React Router working</p>
        <p>✅ Error boundary active</p>
      </div>
    </div>
  );
};

const DebugApp = () => {
  console.log('🔧 DebugApp component rendering');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="*" element={<TestHome />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

console.log('📤 Exporting DebugApp');
export default DebugApp;