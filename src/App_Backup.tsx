import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleAuthProvider } from "./contexts/RoleAuthContext";
import { BlockchainProvider } from "./contexts/BlockchainContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NGODashboard from "./pages/NGODashboard";
import AuditorDashboard from "./pages/AuditorDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import AuthDemo from "./pages/AuthDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const WagmiProviderWrapper = ({ children }: { children: React.ReactNode }) => (
  <Web3Provider>{children}</Web3Provider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WagmiProviderWrapper>
      <TooltipProvider>
        <ErrorBoundary>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Layout>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/registry" element={<Registry />} />
              <Route path="/map" element={<Map />} />
              <Route path="/auth-demo" element={<AuthDemo />} />
              <Route path="/camera-test" element={<CameraTest />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/project-details" element={<ProjectDetails />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              } />
              <Route path="/submit" element={
                <ProtectedRoute>
                  <Submit />
                </ProtectedRoute>
              } />
              <Route path="/verification" element={
                <ProtectedRoute>
                  <Verification />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/marketplace" element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/admin-dashboard" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/stats" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
              </Layout>
            </BrowserRouter>
          </AuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </WagmiProviderWrapper>
  </QueryClientProvider>
);

export default App;
