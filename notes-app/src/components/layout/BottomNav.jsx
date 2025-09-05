import React from 'react';
import { motion } from 'framer-motion';
import './BottomNav.css';

const bottomNavItems = [
  {
    id: 'dashboard',
    icon: '📊',
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    id: 'portfolio',
    icon: '💼',
    label: 'Portfolio',
    path: '/portfolio'
  },
  {
    id: 'trading',
    icon: '🔄',
    label: 'Trading',
    path: '/trading',
    isMain: true // Center action button
  },
  {
    id: 'watchlist',
    icon: '👀',
    label: 'Watchlist',
    path: '/watchlist',
    badge: '12'
  },
  {
    id: 'menu',
    icon: '☰',
    label: 'Menu',
    path: '/menu'
  }
];

const BottomNav = ({ 
  activeItem = 'dashboard',
  onNavigate,
  className = '',
  ...props 
}) => {
  const handleNavClick = (item) => {
    if (onNavigate) {
      onNavigate(item);
    }
  };

  return (
    <motion.nav 
      className={`bottom-nav ${className}`}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      <div className="bottom-nav-content">
        {bottomNavItems.map((item, index) => (
          <motion.button
            key={item.id}
            className={`bottom-nav-item ${activeItem === item.id ? 'active' : ''} ${item.isMain ? 'main-action' : ''}`}
            onClick={() => handleNavClick(item)}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="nav-item-content">
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
              
              {item.badge && (
                <motion.span 
                  className="nav-item-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  {item.badge}
                </motion.span>
              )}
              
              {/* Active indicator */}
              {activeItem === item.id && (
                <motion.div 
                  className="active-indicator"
                  layoutId="activeIndicator"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* Background blur effect */}
      <div className="bottom-nav-backdrop" />
    </motion.nav>
  );
};

export default BottomNav;