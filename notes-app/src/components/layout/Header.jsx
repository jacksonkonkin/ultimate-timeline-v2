import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../auth';
import './Header.css';

const Header = ({ 
  onMenuToggle, 
  user = null,
  totalPortfolioValue = 0,
  dailyChange = 0,
  className = '',
  ...props 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  
  const { user: authUser, signOut } = useAuth();
  const isAuthenticated = !!authUser;

  const isPositiveChange = dailyChange >= 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement stock search
    console.log('Search query:', searchQuery);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  const getAvatarInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.header 
      className={`app-header ${className}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      <div className="header-content">
        {/* Logo & Menu Button */}
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={onMenuToggle}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>
          
          <div className="app-logo">
            <span className="logo-icon">📈</span>
            <h1>TradeSim</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="header-center">
          <form onSubmit={handleSearchSubmit} className={`search-form ${showSearch ? 'expanded' : ''}`}>
            <button 
              type="button"
              className="search-toggle"
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Toggle search"
            >
              🔍
            </button>
            <input
              type="text"
              placeholder="Search stocks, ETFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>
        </div>

        {/* Portfolio & User Info */}
        <div className="header-right">
          {/* Portfolio Summary */}
          {user && (
            <div className="portfolio-summary">
              <div className="portfolio-value">
                <span className="portfolio-label">Portfolio</span>
                <span className="portfolio-amount">
                  ${totalPortfolioValue.toLocaleString()}
                </span>
              </div>
              <div className={`daily-change ${isPositiveChange ? 'positive' : 'negative'}`}>
                <span className="change-indicator">
                  {isPositiveChange ? '↗' : '↘'}
                </span>
                <span className="change-amount">
                  {isPositiveChange ? '+' : ''}{dailyChange.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {/* User Avatar / Auth */}
          <div className="user-section">
            {isAuthenticated && authUser ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="user-avatar-button">
                    {authUser.user_metadata?.avatar_url ? (
                      <img 
                        src={authUser.user_metadata.avatar_url} 
                        alt={authUser.user_metadata?.full_name || 'User'} 
                        className="avatar-image"
                      />
                    ) : (
                      <div className="avatar-initials">
                        {getAvatarInitials(authUser.user_metadata?.full_name || authUser.email)}
                      </div>
                    )}
                    <span className="user-name">
                      {authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Trader'}
                    </span>
                    <span className="dropdown-arrow">▾</span>
                  </button>
                </DropdownMenu.Trigger>
                
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="user-dropdown-content">
                    <DropdownMenu.Item 
                      className="dropdown-item"
                      onClick={() => setShowProfileModal(true)}
                    >
                      <span className="dropdown-icon">👤</span>
                      Profile
                    </DropdownMenu.Item>
                    
                    <DropdownMenu.Separator className="dropdown-separator" />
                    
                    <DropdownMenu.Item 
                      className="dropdown-item"
                      onClick={handleSignOut}
                    >
                      <span className="dropdown-icon">🚪</span>
                      Sign Out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <button 
                className="auth-button"
                onClick={() => window.location.href = '/signin'}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfile 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </motion.header>
  );
};

export default Header;