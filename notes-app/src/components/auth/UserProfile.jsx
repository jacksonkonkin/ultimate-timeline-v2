import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { useAuthStore } from '../../store/authStore';
import './UserProfile.css';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, signOut, updateProfile, isLoading, getUserProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: ''
  });
  const [activeTab, setActiveTab] = useState('profile');

  const userProfile = getUserProfile();

  React.useEffect(() => {
    if (userProfile) {
      setEditForm({
        fullName: userProfile.fullName || '',
        email: userProfile.email || ''
      });
    }
  }, [userProfile]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const { data, error } = await updateProfile({
      full_name: editForm.fullName
    });

    if (!error) {
      setIsEditing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateWinRate = () => {
    const total = userProfile?.totalTrades || 0;
    const wins = userProfile?.wins || 0;
    return total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
  };

  const getPerformanceClass = (value) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  if (!userProfile) {
    return null;
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="profile-modal-overlay" />
        <Dialog.Content className="profile-modal-content">
          <div className="profile-modal-header">
            <Dialog.Title className="profile-modal-title">
              User Profile
            </Dialog.Title>
            <Dialog.Close className="profile-modal-close">
              ×
            </Dialog.Close>
          </div>

          <div className="profile-modal-body">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="profile-tabs">
              <Tabs.List className="profile-tabs-list">
                <Tabs.Trigger value="profile" className="profile-tab">
                  Profile
                </Tabs.Trigger>
                <Tabs.Trigger value="stats" className="profile-tab">
                  Statistics
                </Tabs.Trigger>
                <Tabs.Trigger value="settings" className="profile-tab">
                  Settings
                </Tabs.Trigger>
              </Tabs.List>

              {/* Profile Tab */}
              <Tabs.Content value="profile" className="profile-tab-content">
                <div className="profile-info">
                  <div className="profile-avatar">
                    <div className="avatar-circle">
                      {userProfile.fullName ? 
                        userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase() :
                        userProfile.email[0].toUpperCase()
                      }
                    </div>
                  </div>

                  {!isEditing ? (
                    <div className="profile-details">
                      <h3 className="profile-name">
                        {userProfile.fullName || 'Unnamed Trader'}
                      </h3>
                      <p className="profile-email">{userProfile.email}</p>
                      <p className="profile-joined">
                        Joined {formatDate(userProfile.createdAt)}
                      </p>
                      
                      <button 
                        className="edit-profile-btn"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleEditSubmit} className="edit-profile-form">
                      <div className="form-field">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                          id="fullName"
                          type="text"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                          className="form-input"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div className="form-field">
                        <label htmlFor="email">Email</label>
                        <input
                          id="email"
                          type="email"
                          value={editForm.email}
                          disabled
                          className="form-input form-input-disabled"
                          title="Email cannot be changed"
                        />
                      </div>

                      <div className="form-actions">
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="save-btn"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </Tabs.Content>

              {/* Statistics Tab */}
              <Tabs.Content value="stats" className="profile-tab-content">
                <div className="trading-stats">
                  <h3 className="stats-title">Trading Performance</h3>
                  
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-label">Portfolio Value</div>
                      <div className="stat-value primary">
                        {formatCurrency(userProfile.currentBalance)}
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-label">Total Profit/Loss</div>
                      <div className={`stat-value ${getPerformanceClass(userProfile.currentBalance - userProfile.startingBalance)}`}>
                        {formatCurrency(userProfile.currentBalance - userProfile.startingBalance)}
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-label">Total Trades</div>
                      <div className="stat-value">{userProfile.totalTrades}</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-label">Win Rate</div>
                      <div className="stat-value">{calculateWinRate()}%</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-label">Winning Trades</div>
                      <div className="stat-value positive">{userProfile.wins}</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-label">Losing Trades</div>
                      <div className="stat-value negative">{userProfile.losses}</div>
                    </div>
                  </div>

                  <div className="performance-summary">
                    <h4>Performance Summary</h4>
                    <div className="summary-item">
                      <span>Starting Balance:</span>
                      <span>{formatCurrency(userProfile.startingBalance)}</span>
                    </div>
                    <div className="summary-item">
                      <span>Current Balance:</span>
                      <span className={getPerformanceClass(userProfile.currentBalance - userProfile.startingBalance)}>
                        {formatCurrency(userProfile.currentBalance)}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span>Net Return:</span>
                      <span className={getPerformanceClass(userProfile.currentBalance - userProfile.startingBalance)}>
                        {((userProfile.currentBalance - userProfile.startingBalance) / userProfile.startingBalance * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Tabs.Content>

              {/* Settings Tab */}
              <Tabs.Content value="settings" className="profile-tab-content">
                <div className="profile-settings">
                  <h3 className="settings-title">Account Settings</h3>
                  
                  <div className="settings-section">
                    <h4>Account Management</h4>
                    <div className="settings-item">
                      <div className="setting-info">
                        <span className="setting-label">Sign Out</span>
                        <span className="setting-description">
                          Sign out of your account on this device
                        </span>
                      </div>
                      <button className="signout-btn" onClick={handleSignOut}>
                        Sign Out
                      </button>
                    </div>
                  </div>

                  <div className="settings-section">
                    <h4>Trading Settings</h4>
                    <div className="settings-item">
                      <div className="setting-info">
                        <span className="setting-label">Reset Portfolio</span>
                        <span className="setting-description">
                          Reset your portfolio to starting balance (coming soon)
                        </span>
                      </div>
                      <button className="reset-btn" disabled>
                        Reset Portfolio
                      </button>
                    </div>
                  </div>

                  <div className="account-info">
                    <h4>Account Information</h4>
                    <div className="info-item">
                      <span>User ID:</span>
                      <span className="user-id">{userProfile.id}</span>
                    </div>
                    <div className="info-item">
                      <span>Account Created:</span>
                      <span>{formatDate(userProfile.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UserProfile;