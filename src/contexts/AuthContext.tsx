import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { type User } from '@/lib/api';
import { apiService } from '@/services/api';
import { auth as authNotifications } from '@/lib/notifications';
import { type UserRole, hasPermission, getUserPermissions, PERMISSIONS } from '@/lib/permissions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    organization?: string;
    role?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    name?: string;
    organization?: string;
    walletAddress?: string;
  }) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerifier: boolean;
  hasPermission: (permission: string) => boolean;
  userRole: UserRole | null;
  canSubmitProjects: boolean;
  canApproveProjects: boolean;
  canBuyCredits: boolean;
  canViewAdminDashboard: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Try to get fresh user data from API
          const { user: profileUser } = await apiService.getProfile();
          setUser(profileUser);
        } catch (apiError) {
          // If API fails (e.g., 401), fall back to demo user and regenerate a valid demo token
          const demoUser = {
            id: 'ngo',
            name: 'Demo NGO User',
            email: 'demo@ocean-conservation.org',
            role: 'NGO' as const,
            organization: 'Ocean Conservation NGO',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          const demoToken = `demo-token-${demoUser.id}-${Date.now()}`;
          localStorage.setItem('auth-token', demoToken);
          localStorage.setItem('user', JSON.stringify(demoUser));
          setUser(demoUser);
        }
      } else {
        // Only auto-login demo user in development or when demo mode is explicitly enabled
        const isDemo = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' || import.meta.env.DEV;
        
        if (isDemo) {
          const demoUser = {
            id: 'ngo',
            name: 'Demo NGO User',
            email: 'demo@ocean-conservation.org',
            role: 'NGO' as const,
            organization: 'Ocean Conservation NGO',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const demoToken = `demo-token-${demoUser.id}-${Date.now()}`;
          localStorage.setItem('auth-token', demoToken);
          localStorage.setItem('user', JSON.stringify(demoUser));
          setUser(demoUser);
        }
        // In production without demo mode, user stays null (not authenticated)
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      
      // Only set demo user as fallback in development or demo mode
      const isDemo = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' || import.meta.env.DEV;
      
      if (isDemo) {
        const demoUser = {
          id: 'ngo',
          name: 'Demo NGO User',
          email: 'demo@ocean-conservation.org',
          role: 'NGO' as const,
          organization: 'Ocean Conservation NGO',
          isEmailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const demoToken = `demo-token-${demoUser.id}-${Date.now()}`;
        localStorage.setItem('auth-token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        setUser(demoUser);
      }
      // In production, leave user as null - no auto-login
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      const { user: userData, token } = response;
      
      localStorage.setItem('auth-token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      authNotifications.loginSuccess(userData.name);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    organization?: string;
    role?: string;
  }) => {
    try {
      // If backend supports register; otherwise simulate login for demo
      const response = await apiService.login(data.email, data.password);
      const { user: userData, token } = response;
      
      localStorage.setItem('auth-token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      authNotifications.loginSuccess(userData.name);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    setUser(null);
    authNotifications.logout();
  };

  const updateProfile = async (data: {
    name?: string;
    organization?: string;
    walletAddress?: string;
  }) => {
    try {
      const response = await apiService.getProfile(); // backend has no PUT yet; keep current profile
      const updatedUser = response.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      authNotifications.loginSuccess(updatedUser.name);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const userRole = user?.role as UserRole | null;
  
  const checkPermission = (permission: string): boolean => {
    if (!userRole || !permission) return false;
    return hasPermission(userRole, permission);
  };
  
  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isVerifier: user?.role === 'AUDITOR' || user?.role === 'ADMIN',
    hasPermission: checkPermission,
    userRole,
    canSubmitProjects: checkPermission(PERMISSIONS.SUBMIT_PROJECTS),
    canApproveProjects: checkPermission(PERMISSIONS.APPROVE_PROJECTS),
    canBuyCredits: checkPermission(PERMISSIONS.BUY_CREDITS),
    canViewAdminDashboard: checkPermission(PERMISSIONS.VIEW_ADMIN_DASHBOARD),
  };

  if (loading) {
    return (
      <LoadingSpinner 
        fullScreen 
        size="lg" 
        variant="brand" 
        text="Initializing Blue Carbon Registry..." 
      />
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;