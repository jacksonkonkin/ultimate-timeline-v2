import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuthStore } from '../../store/authStore';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn, signUp, resetPassword, isLoading, error, clearError } = useAuthStore();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(); // Clear errors when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'login') {
      const { data, error } = await signIn(formData.email, formData.password);
      if (!error) {
        onClose();
      }
    } else if (activeTab === 'register') {
      if (formData.password !== formData.confirmPassword) {
        return;
      }
      
      const { data, error } = await signUp(
        formData.email, 
        formData.password, 
        { fullName: formData.fullName }
      );
      if (!error) {
        onClose();
      }
    } else if (activeTab === 'forgot') {
      const { data, error } = await resetPassword(formData.email);
      if (!error) {
        // Show success message
        setActiveTab('login');
      }
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
    clearError();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="auth-modal-overlay" />
        <Dialog.Content className="auth-modal-content">
          <div className="auth-modal-header">
            <Dialog.Title className="auth-modal-title">
              {activeTab === 'login' && 'Welcome Back'}
              {activeTab === 'register' && 'Create Account'}
              {activeTab === 'forgot' && 'Reset Password'}
            </Dialog.Title>
            <Dialog.Description className="auth-modal-description">
              {activeTab === 'login' && 'Sign in to continue trading'}
              {activeTab === 'register' && 'Start your trading journey with $100,000 virtual money'}
              {activeTab === 'forgot' && 'Enter your email to reset your password'}
            </Dialog.Description>
            <Dialog.Close className="auth-modal-close">
              ×
            </Dialog.Close>
          </div>

          <div className="auth-modal-body">
            {/* Tab Navigation */}
            {activeTab !== 'forgot' && (
              <div className="auth-tabs">
                <button 
                  className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => switchTab('login')}
                  type="button"
                >
                  Sign In
                </button>
                <button 
                  className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => switchTab('register')}
                  type="button"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="auth-error">
                <span className="auth-error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Forms */}
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Full Name - Register only */}
              {activeTab === 'register' && (
                <div className="auth-field">
                  <label htmlFor="fullName" className="auth-label">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    className="auth-input"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="email" className="auth-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              {activeTab !== 'forgot' && (
                <div className="auth-field">
                  <label htmlFor="password" className="auth-label">
                    Password
                  </label>
                  <div className="auth-password-field">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password - Register only */}
              {activeTab === 'register' && (
                <div className="auth-field">
                  <label htmlFor="confirmPassword" className="auth-label">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="auth-input"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                  {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                    <span className="auth-field-error">Passwords don't match</span>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={isLoading || (activeTab === 'register' && formData.password !== formData.confirmPassword)}
              >
                {isLoading ? (
                  <span className="auth-loading">⏳ Please wait...</span>
                ) : (
                  <>
                    {activeTab === 'login' && 'Sign In'}
                    {activeTab === 'register' && 'Create Account'}
                    {activeTab === 'forgot' && 'Send Reset Email'}
                  </>
                )}
              </button>

              {/* Footer Links */}
              <div className="auth-footer">
                {activeTab === 'login' && (
                  <>
                    <button 
                      type="button" 
                      className="auth-link"
                      onClick={() => switchTab('forgot')}
                    >
                      Forgot password?
                    </button>
                    <span>
                      Don't have an account?{' '}
                      <button 
                        type="button" 
                        className="auth-link"
                        onClick={() => switchTab('register')}
                      >
                        Sign up
                      </button>
                    </span>
                  </>
                )}
                
                {activeTab === 'register' && (
                  <span>
                    Already have an account?{' '}
                    <button 
                      type="button" 
                      className="auth-link"
                      onClick={() => switchTab('login')}
                    >
                      Sign in
                    </button>
                  </span>
                )}

                {activeTab === 'forgot' && (
                  <button 
                    type="button" 
                    className="auth-link"
                    onClick={() => switchTab('login')}
                  >
                    ← Back to sign in
                  </button>
                )}
              </div>
            </form>

            {/* Demo Info for Register */}
            {activeTab === 'register' && (
              <div className="auth-demo-info">
                <h4>🎮 Trading Simulator Features</h4>
                <ul>
                  <li>🏦 Start with $100,000 virtual money</li>
                  <li>📈 Real-time stock data & charts</li>
                  <li>🏆 Achievements & leaderboards</li>
                  <li>📊 Performance tracking</li>
                </ul>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AuthModal;