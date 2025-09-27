import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import { Waves } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireVerifier?: boolean;
  requirePermission?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requireVerifier = false, 
  requirePermission 
}: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isVerifier, userRole, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto">
              <Waves className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600">Loading Blue Carbon Registry...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirements
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" state={{ accessDenied: 'admin' }} replace />;
  }

  // Check verifier requirements  
  if (requireVerifier && !isVerifier) {
    return <Navigate to="/dashboard" state={{ accessDenied: 'verifier' }} replace />;
  }

  // Check specific permission requirements
  if (requirePermission && userRole && !hasPermission(userRole, requirePermission)) {
    return <Navigate to="/dashboard" state={{ accessDenied: 'permission' }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;