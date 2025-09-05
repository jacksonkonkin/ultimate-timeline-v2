import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

const DatabaseChecker = ({ onClose }) => {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkDatabase = async () => {
    setIsLoading(true);
    try {
      const checks = {};
      
      // Check auth users (current user only)
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          checks.currentUser = { error: userError.message };
        } else {
          checks.currentUser = { success: true, data: user };
        }
      } catch (error) {
        checks.currentUser = { error: error.message };
      }

      // Check auth session
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          checks.session = { error: sessionError.message };
        } else {
          checks.session = { success: true, data: session };
        }
      } catch (error) {
        checks.session = { error: error.message };
      }

      // Check if user has proper metadata
      if (checks.currentUser?.data) {
        const user = checks.currentUser.data;
        checks.userMetadata = {
          success: true,
          data: {
            role: user.user_metadata?.role || 'user',
            status: user.user_metadata?.user_status || 'pending',
            fullName: user.user_metadata?.full_name || 'No name',
            balance: user.user_metadata?.current_balance || 100000
          }
        };
      }

      setResults(checks);
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const makeUserAdmin = async () => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          role: 'admin',
          user_status: 'approved'
        }
      });

      if (error) {
        alert(`Error updating user: ${error.message}`);
      } else {
        alert('User updated to admin successfully!');
        checkDatabase(); // Refresh the data
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2>Database Diagnostic Tool</h2>
        
        <button 
          onClick={checkDatabase} 
          disabled={isLoading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {isLoading ? 'Checking...' : 'Check Database'}
        </button>

        {results && (
          <div style={{ marginBottom: '2rem' }}>
            <h3>Results:</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <h4>Current User:</h4>
              {results.currentUser?.error ? (
                <div style={{ color: 'orange' }}>⚠️ No user: {results.currentUser.error}</div>
              ) : results.currentUser?.data ? (
                <div>
                  ✅ Logged in: {results.currentUser.data.email}
                  <br />User ID: {results.currentUser.data.id}
                  <br />Email confirmed: {results.currentUser.data.email_confirmed_at ? '✅ Yes' : '❌ No'}
                </div>
              ) : (
                <div>❌ No current user</div>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4>User Metadata (Role & Status):</h4>
              {results.userMetadata?.data ? (
                <div>
                  <div>👑 Role: <strong>{results.userMetadata.data.role}</strong></div>
                  <div>📋 Status: <strong>{results.userMetadata.data.status}</strong></div>
                  <div>👤 Name: <strong>{results.userMetadata.data.fullName}</strong></div>
                  <div>💰 Balance: <strong>${results.userMetadata.data.balance.toLocaleString()}</strong></div>
                  
                  {results.userMetadata.data.role !== 'admin' && (
                    <div style={{ marginTop: '1rem' }}>
                      <button
                        onClick={makeUserAdmin}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        👑 Make Admin
                      </button>
                    </div>
                  )}
                  
                  {results.userMetadata.data.role === 'admin' && results.userMetadata.data.status === 'approved' && (
                    <div style={{ marginTop: '1rem', color: 'green' }}>
                      🎉 <strong>This user is a fully set up admin!</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: 'orange' }}>⚠️ No user metadata found</div>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4>Session:</h4>
              {results.session?.error ? (
                <div style={{ color: 'orange' }}>⚠️ No session: {results.session.error}</div>
              ) : results.session?.data ? (
                <div>✅ Active session</div>
              ) : (
                <div>❌ No active session</div>
              )}
            </div>
            
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
              <strong>💡 Simplified Approach:</strong>
              <br />This app now uses only Supabase auth with user metadata. 
              <br />No separate profiles table is needed!
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DatabaseChecker;