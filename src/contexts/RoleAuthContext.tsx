import React, { createContext, useContext, useState, useEffect } from 'react';
import { FIXED_WALLETS } from '../utils/fixedWallets';

export type UserRole = 'NGO' | 'AUDITOR' | 'COMPANY';

export interface TestAccount {
  role: UserRole;
  address: string;
  name: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: TestAccount | null;
  role: UserRole | null;
}

interface RoleAuthContextType {
  authState: AuthState;
  login: (account: TestAccount) => void;
  logout: () => void;
  switchRole: (account: TestAccount) => void;
}

// Test accounts for different roles - Indian Organizations 🇮🇳
export const TEST_ACCOUNTS: TestAccount[] = [
  {
    role: 'NGO',
    address: FIXED_WALLETS.NGO,
    name: 'Mumbai Coastal Conservation Society',
    email: 'info@mumbaicoastal.org.in'
  },
  {
    role: 'AUDITOR', 
    address: FIXED_WALLETS.AUDITOR,
    name: 'Maharashtra Blue Carbon Authority',
    email: 'auditor@mahabluecarbon.gov.in'
  },
  {
    role: 'COMPANY',
    address: FIXED_WALLETS.COMPANY,
    name: 'Tata Sustainability Solutions',
    email: 'carbon.offset@tata.com'
  }
];

const RoleAuthContext = createContext<RoleAuthContextType | undefined>(undefined);

export const useRoleAuth = () => {
  const context = useContext(RoleAuthContext);
  if (!context) {
    throw new Error('useRoleAuth must be used within RoleAuthProvider');
  }
  return context;
};

export const RoleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: null
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('roleAuth');
    if (savedAuth) {
      try {
        const parsedAuth = JSON.parse(savedAuth);
        setAuthState(parsedAuth);
      } catch (error) {
        console.error('Failed to parse saved auth state:', error);
        localStorage.removeItem('roleAuth');
      }
    }
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.setItem('roleAuth', JSON.stringify(authState));
    } else {
      localStorage.removeItem('roleAuth');
    }
  }, [authState]);

  const login = (account: TestAccount) => {
    setAuthState({
      isAuthenticated: true,
      user: account,
      role: account.role
    });
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: null
    });
  };

  const switchRole = (account: TestAccount) => {
    setAuthState({
      isAuthenticated: true,
      user: account,
      role: account.role
    });
  };

  return (
    <RoleAuthContext.Provider value={{ authState, login, logout, switchRole }}>
      {children}
    </RoleAuthContext.Provider>
  );
};