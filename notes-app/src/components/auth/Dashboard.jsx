import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import './auth.css';

const Dashboard = () => {
  const { user, signOut, userProfile } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async (e) => {
    e.preventDefault();

    try {
      await signOut();
      navigate("/signin");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">Trading Simulator Dashboard</h1>
          <div className="user-info">
            <span className="user-email">Welcome, {user?.email}</span>
            <button onClick={handleSignOut} className="sign-out-button">
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2 className="welcome-title">Welcome to Your Trading Dashboard</h2>
          
          {userProfile && (
            <div className="profile-card">
              <h3 className="profile-title">Profile Information</h3>
              <div className="profile-grid">
                <div className="profile-item">
                  <span className="profile-label">Email:</span>
                  <p className="profile-value">{user?.email}</p>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Status:</span>
                  <p className={`status-badge ${
                    userProfile.status === 'approved' 
                      ? 'status-approved'
                      : userProfile.status === 'pending'
                      ? 'status-pending'
                      : 'status-rejected'
                  }`}>
                    {userProfile.status?.toUpperCase() || 'PENDING'}
                  </p>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Role:</span>
                  <p className="profile-value">{userProfile.role || 'User'}</p>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Balance:</span>
                  <p className="profile-value">${userProfile.current_balance?.toLocaleString() || '100,000'}</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-secondary" style={{ marginBottom: 'var(--space-2xl)', fontSize: 'var(--text-base)' }}>
            Your comprehensive trading simulator is ready! Start by exploring the features below.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">Portfolio</h3>
              <p className="feature-description">
                View your current holdings and performance
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Markets</h3>
              <p className="feature-description">
                Explore stocks and trading opportunities
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Analytics</h3>
              <p className="feature-description">
                Track your trading performance and insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;