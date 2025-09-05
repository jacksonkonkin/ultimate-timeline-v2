import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import './Layout.css';

const Layout = ({ 
  children,
  user = null,
  totalPortfolioValue = 0,
  dailyChange = 0,
  activeNavItem = 'dashboard',
  onNavigate,
  isAdmin = false,
  className = '',
  ...props 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and set mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 639;
      setIsMobile(mobile);
      
      // Auto-collapse sidebar on tablet
      if (window.innerWidth <= 1023 && window.innerWidth > 639) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth > 1023) {
        setSidebarCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.menu-toggle')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Close mobile sidebar on navigation
  const handleNavigate = (item) => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    if (onNavigate) {
      onNavigate(item);
    }
  };

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarToggleCollapse = () => {
    if (!isMobile) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className={`app-layout ${className}`} {...props}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <Header
        onMenuToggle={handleMenuToggle}
        user={user}
        totalPortfolioValue={totalPortfolioValue}
        dailyChange={dailyChange}
        className="layout-header"
      />

      {/* Main Layout Container */}
      <div className="layout-container">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleSidebarToggleCollapse}
          onNavigate={handleNavigate}
          activeItem={activeNavItem}
          isAdmin={isAdmin}
          className="layout-sidebar"
        />

        {/* Main Content Area */}
        <motion.main 
          className={`layout-main ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
          animate={{
            marginLeft: isMobile ? 0 : (sidebarCollapsed ? '64px' : '20px')
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="main-content">
            {children}
          </div>
        </motion.main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNav
        activeItem={activeNavItem}
        onNavigate={onNavigate}
        className="layout-bottom-nav"
      />
    </div>
  );
};

// Page wrapper component for individual pages
const PageWrapper = ({ 
  title,
  subtitle,
  actions,
  breadcrumbs,
  children,
  className = '',
  loading = false,
  error = null,
  ...props 
}) => {
  return (
    <div className={`page-wrapper ${className}`} {...props}>
      {/* Page Header */}
      {(title || subtitle || actions || breadcrumbs) && (
        <div className="page-header">
          {breadcrumbs && (
            <nav className="breadcrumbs">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="breadcrumb-separator">›</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="breadcrumb-link">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="breadcrumb-current">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          
          <div className="page-title-section">
            {title && (
              <h1 className="page-title">{title}</h1>
            )}
            {subtitle && (
              <p className="page-subtitle">{subtitle}</p>
            )}
          </div>
          
          {actions && (
            <div className="page-actions">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      <div className="page-content">
        {loading ? (
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <span>Loading...</span>
          </div>
        ) : error ? (
          <div className="page-error">
            <div className="error-icon">⚠️</div>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export { Layout, PageWrapper };
export default Layout;