import React from 'react';
import { useRoleAuth } from "../contexts/RoleAuthContext";
import { NavLink } from "react-router-dom";

const SimpleHome = () => {
  const { authState } = useRoleAuth();
  const { isAuthenticated, user } = authState;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        color: 'white',
        borderRadius: '1rem',
        marginBottom: '3rem'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🌊 Blue Carbon Credits System
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Transparent, blockchain-verified carbon credits from coastal ecosystem restoration projects
        </p>
        
        {!isAuthenticated ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <NavLink 
              to="/auth-demo"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              🎭 Try Demo
            </NavLink>
            <NavLink 
              to="/login"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                backgroundColor: 'white',
                color: '#0284c7',
                textDecoration: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Login
            </NavLink>
          </div>
        ) : (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.5rem', display: 'inline-block' }}>
            <p style={{ margin: 0, marginBottom: '1rem' }}>
              Welcome back, <strong>{user?.name}</strong>!
            </p>
            <NavLink 
              to="/dashboard"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: '#0284c7',
                textDecoration: 'none',
                borderRadius: '0.375rem',
                fontWeight: '600'
              }}
            >
              Go to Dashboard →
            </NavLink>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#f8fafc', 
          borderRadius: '1rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
            🏛️ For NGOs
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Submit blue carbon restoration projects and receive blockchain-verified carbon credits
          </p>
          {!isAuthenticated && (
            <NavLink 
              to="/auth-demo"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#22c55e',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Try NGO Demo
            </NavLink>
          )}
        </div>

        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#f8fafc', 
          borderRadius: '1rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
            🛡️ For Auditors
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Verify restoration projects and mint carbon credits using blockchain technology
          </p>
          {!isAuthenticated && (
            <NavLink 
              to="/auth-demo"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Try Auditor Demo
            </NavLink>
          )}
        </div>

        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#f8fafc', 
          borderRadius: '1rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
            🏢 For Companies
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Purchase verified carbon credits for ESG compliance and sustainability goals
          </p>
          {!isAuthenticated && (
            <NavLink 
              to="/auth-demo"
              style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: '#8b5cf6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Try Company Demo
            </NavLink>
          )}
        </div>
      </div>

      {/* System Status */}
      <div style={{ 
        padding: '2rem', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '1rem',
        border: '1px solid #bae6fd',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0c4a6e' }}>
          🚀 System Status
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div>✅ Blockchain Integration Active</div>
          <div>✅ Role-Based Authentication</div>
          <div>✅ Real Wallet Transactions</div>
          <div>✅ Sepolia Testnet Connected</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;