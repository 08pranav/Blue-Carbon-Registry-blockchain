import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, type User } from '@/lib/api';
import { toast } from 'sonner';
import { type UserRole, hasPermission, getUserPermissions, PERMISSIONS } from '@/lib/permissions';

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
          const userData = await authAPI.getProfile();
          setUser(userData.user);
        } catch (apiError) {
          // If API fails, use stored user data (for demo mode)
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token } = response;
      
      localStorage.setItem('auth-token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.name}!`);
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
      const response = await authAPI.register(data);
      const { user: userData, token } = response;
      
      localStorage.setItem('auth-token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success(`Account created successfully! Welcome, ${userData.name}!`);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('You have been logged out');
  };

  const updateProfile = async (data: {
    name?: string;
    organization?: string;
    walletAddress?: string;
  }) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.user;
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile updated successfully');
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;