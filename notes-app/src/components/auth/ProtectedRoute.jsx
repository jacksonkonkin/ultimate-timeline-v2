import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import PendingApproval from './PendingApproval';
import AuthModal from './AuthModal';
import AdminCreator from '../AdminCreator';
import DatabaseChecker from '../DatabaseChecker';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminCreator, setShowAdminCreator] = useState(false);
  const [showDatabaseChecker, setShowDatabaseChecker] = useState(false);
  const { isAuthenticated, isAdmin, isApproved, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: 'var(--text-secondary)' 
      }}>
        ⏳ Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: 'var(--bg-primary)'
        }}>
          <div>
            <h2 style={{ marginBottom: '1rem' }}>🔐 Welcome to Trading Simulator</h2>
            <p style={{ marginBottom: '2rem' }}>Please sign in or create an account to get started.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowAuthModal(true)}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                Sign In / Sign Up
              </button>
              
              <button 
                onClick={() => setShowAdminCreator(true)}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                👑 Create Admin
              </button>
              
              <button 
                onClick={() => setShowDatabaseChecker(true)}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                🔍 Debug DB
              </button>
            </div>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          defaultTab="login"
        />
        
        {showAdminCreator && (
          <AdminCreator 
            onClose={() => setShowAdminCreator(false)} 
          />
        )}
        
        {showDatabaseChecker && (
          <DatabaseChecker 
            onClose={() => setShowDatabaseChecker(false)} 
          />
        )}
      </>
    );
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h2>🚫 Admin Access Required</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (!requireAdmin && !isApproved()) {
    return <PendingApproval />;
  }

  return children;
};

export default ProtectedRoute;