import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './auth-simplified.css';

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  if (!user) return null;

  const userMetadata = user.user_metadata || {};
  const displayName = userMetadata.full_name || user.email?.split('@')[0] || 'User';
  const balance = userMetadata.current_balance || 100000;

  return (
    <div className="user-menu-container">
      <button 
        className="user-menu-trigger"
        onClick={() => setShowMenu(!showMenu)}
      >
        <div className="user-info">
          <span className="user-name">{displayName}</span>
          <span className="user-balance">${balance.toLocaleString()}</span>
        </div>
        <div className="user-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </button>

      {showMenu && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <div className="user-email">{user.email}</div>
            <div className="user-stats">
              <span>Trades: {userMetadata.total_trades || 0}</span>
              <span>W/L: {userMetadata.wins || 0}/{userMetadata.losses || 0}</span>
            </div>
          </div>
          
          <div className="user-menu-items">
            <button onClick={() => navigate('/profile')}>
              Profile Settings
            </button>
            <button onClick={() => navigate('/portfolio')}>
              My Portfolio
            </button>
            <button onClick={() => navigate('/history')}>
              Trade History
            </button>
            <button onClick={handleSignOut} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;