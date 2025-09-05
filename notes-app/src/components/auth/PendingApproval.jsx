import React from 'react';
import { useAuthStore } from '../../store/authStore';
import './PendingApproval.css';

const PendingApproval = () => {
  const { signOut, getUserProfile } = useAuthStore();
  const profile = getUserProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="pending-approval">
      <div className="pending-approval-container">
        <div className="pending-approval-icon">
          ⏳
        </div>
        
        <h1>Account Pending Approval</h1>
        
        <p className="pending-approval-message">
          Thank you for registering, <strong>{profile?.fullName || profile?.email}</strong>!
        </p>
        
        <p>
          Your account is currently pending admin approval. You'll be able to access 
          the trading simulator once an administrator reviews and approves your account.
        </p>
        
        <div className="pending-approval-info">
          <h3>What happens next?</h3>
          <ul>
            <li>📧 You'll receive an email notification when your account is approved</li>
            <li>🔐 Once approved, you can log in and start trading</li>
            <li>💰 You'll start with $100,000 in virtual trading money</li>
            <li>📊 Access to real-time market data and charts</li>
          </ul>
        </div>
        
        <div className="pending-approval-actions">
          <p className="help-text">
            Questions? Contact support or check back later.
          </p>
          
          <button 
            onClick={handleSignOut} 
            className="sign-out-btn"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;