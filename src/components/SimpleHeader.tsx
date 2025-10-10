import React from 'react';
import { NavLink } from "react-router-dom";
import { useRoleAuth } from "@/contexts/RoleAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Shield, 
  User,
  LogOut,
  Waves
} from "lucide-react";

const SimpleHeader = () => {
  const { authState, logout } = useRoleAuth();
  const { isAuthenticated, user } = authState;
  const userRole = authState.role;

  return (
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 50, 
      width: '100%', 
      borderBottom: '1px solid #e5e7eb', 
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)'
    }}>
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Waves style={{ width: '2rem', height: '2rem', color: '#2563eb' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            Blue Carbon Credits
          </span>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <NavLink 
            to="/" 
            style={{ 
              textDecoration: 'none', 
              color: '#374151', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Home style={{ width: '1rem', height: '1rem' }} />
            Home
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink 
                to="/dashboard" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#374151', 
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Shield style={{ width: '1rem', height: '1rem' }} />
                Dashboard
              </NavLink>
              
              <NavLink 
                to="/auth-demo" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#374151', 
                  fontWeight: '500'
                }}
              >
                Auth Demo
              </NavLink>
            </>
          )}

          {/* User Info & Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isAuthenticated ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User style={{ width: '1rem', height: '1rem' }} />
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {user?.name}
                  </span>
                  {userRole && (
                    <Badge style={{ 
                      backgroundColor: '#dbeafe', 
                      color: '#1e40af',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}>
                      {userRole}
                    </Badge>
                  )}
                </div>
                <Button 
                  onClick={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut style={{ width: '1rem', height: '1rem' }} />
                  Logout
                </Button>
              </>
            ) : (
              <NavLink 
                to="/login"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500'
                }}
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default SimpleHeader;