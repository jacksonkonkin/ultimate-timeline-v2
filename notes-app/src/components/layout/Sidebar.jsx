import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Sidebar.css';

const navigationItems = [
  {
    id: 'dashboard',
    icon: '📊',
    label: 'Dashboard',
    path: '/dashboard',
    badge: null
  },
  {
    id: 'portfolio',
    icon: '💼',
    label: 'Portfolio',
    path: '/portfolio',
    badge: null
  },
  {
    id: 'trading',
    icon: '🔄',
    label: 'Trading',
    path: '/trading',
    badge: 'Hot'
  },
  {
    id: 'research',
    icon: '🔍',
    label: 'Research',
    path: '/research',
    badge: null
  },
  {
    id: 'watchlist',
    icon: '👀',
    label: 'Watchlist',
    path: '/watchlist',
    badge: '12'
  },
  {
    id: 'history',
    icon: '📈',
    label: 'History',
    path: '/history',
    badge: null
  },
  {
    id: 'analytics',
    icon: '📉',
    label: 'Analytics',
    path: '/analytics',
    badge: null
  },
  {
    id: 'leaderboard',
    icon: '🏆',
    label: 'Leaderboard',
    path: '/leaderboard',
    badge: null
  },
  {
    id: 'achievements',
    icon: '🎖️',
    label: 'Achievements',
    path: '/achievements',
    badge: '3'
  },
  {
    id: 'settings',
    icon: '⚙️',
    label: 'Settings',
    path: '/settings',
    badge: null
  }
];

const Sidebar = ({ 
  isOpen = true, 
  isCollapsed = false, 
  onToggleCollapse,
  onNavigate,
  activeItem = 'dashboard',
  isAdmin = false,
  className = '',
  ...props 
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Add admin navigation item if user is admin
  const adminNavItem = {
    id: 'admin',
    icon: '👑',
    label: 'Admin',
    path: '/admin',
    badge: null
  };

  const allNavigationItems = isAdmin 
    ? [...navigationItems, adminNavItem]
    : navigationItems;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 639);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavClick = (item) => {
    if (onNavigate) {
      onNavigate(item);
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    closed: {
      x: '-100%',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const collapseVariants = {
    expanded: {
      width: '240px',
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    collapsed: {
      width: '64px',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <AnimatePresence>
      {(isOpen || !isMobile) && (
        <motion.aside
          className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`}
          variants={isMobile ? sidebarVariants : collapseVariants}
          initial={isMobile ? 'closed' : (isCollapsed ? 'collapsed' : 'expanded')}
          animate={isMobile ? 'open' : (isCollapsed ? 'collapsed' : 'expanded')}
          exit={isMobile ? 'closed' : undefined}
          {...props}
        >
          <div className="sidebar-content">
            {/* Sidebar Header */}
            <div className="sidebar-header">
              {!isCollapsed && (
                <motion.div 
                  className="sidebar-title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Navigation
                </motion.div>
              )}
              <button 
                className="collapse-button"
                onClick={onToggleCollapse}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <span className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>
                  ←
                </span>
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="sidebar-nav">
              <ul className="nav-list">
                {allNavigationItems.map((item, index) => (
                  <motion.li 
                    key={item.id}
                    className="nav-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      className={`nav-link ${activeItem === item.id ? 'active' : ''}`}
                      onClick={() => handleNavClick(item)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      title={isCollapsed ? item.label : ''}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      
                      {!isCollapsed && (
                        <motion.span 
                          className="nav-label"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                      
                      {item.badge && (
                        <span className={`nav-badge ${item.badge === 'Hot' ? 'hot' : 'count'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && hoveredItem === item.id && (
                      <motion.div 
                        className="nav-tooltip"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                      >
                        {item.label}
                        {item.badge && (
                          <span className={`tooltip-badge ${item.badge === 'Hot' ? 'hot' : 'count'}`}>
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Sidebar Footer */}
            {!isCollapsed && (
              <motion.div 
                className="sidebar-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <div className="footer-content">
                  <div className="app-version">
                    <span className="version-label">TradeSim</span>
                    <span className="version-number">v1.0</span>
                  </div>
                  <div className="market-status">
                    <span className="status-indicator active"></span>
                    <span className="status-text">Market Open</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;