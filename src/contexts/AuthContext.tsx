import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, type User } from '@/lib/api';
import { toast } from 'sonner';

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
      if (token) {
        const userData = await authAPI.getProfile();
        setUser(userData.user);
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

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isVerifier: user?.role === 'VERIFIER' || user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;