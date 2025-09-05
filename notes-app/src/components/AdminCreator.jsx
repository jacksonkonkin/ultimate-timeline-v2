import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../utils/supabase';

const AdminCreator = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create admin user with approved status
      const { data, error } = await signUp(formData.email, formData.password, {
        fullName: formData.fullName,
        full_name: formData.fullName, // Supabase uses full_name in raw_user_meta_data
        role: 'admin',
        user_status: 'approved' // Auto-approve admin
      });

      if (error) {
        setResult({ success: false, message: `Error: ${error.message}` });
      } else {
        let successMessage = `Admin user created successfully! You can now sign in with ${formData.email}`;
        
        // Check if user was created
        if (data.user) {
          successMessage += `\n\nUser ID: ${data.user.id}`;
          
          // All user data is stored in user_metadata, no separate profile needed
          successMessage += `\nUser metadata: Role=${data.user.user_metadata?.role}, Status=${data.user.user_metadata?.user_status}`;
          
          if (data.user.email_confirmed_at) {
            successMessage += `\nEmail confirmed automatically.`;
          } else {
            successMessage += `\nPlease check your email to confirm the account.`;
          }
        }
        
        setResult({ 
          success: true, 
          message: successMessage
        });
        setTimeout(() => {
          if (onClose) onClose();
        }, 8000); // Give more time to read the longer message
      }
    } catch (err) {
      setResult({ success: false, message: `Unexpected error: ${err.message}` });
    } finally {
      setIsLoading(false);
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
        width: '400px',
        maxWidth: '90vw'
      }}>
        <h2>Create Admin User</h2>
        
        {result ? (
          <div style={{
            padding: '1rem',
            borderRadius: '4px',
            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
            color: result.success ? '#155724' : '#721c24',
            marginBottom: '1rem'
          }}>
            {result.message}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Full Name:</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Password:</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginTop: '0.25rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Creating...' : 'Create Admin'}
              </button>
              
              <button
                type="button"
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
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminCreator;