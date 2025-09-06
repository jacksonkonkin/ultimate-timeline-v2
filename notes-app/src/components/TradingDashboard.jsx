import React, { useState, useEffect } from 'react';
import { Layout, PageWrapper, ResponsiveGrid } from './layout';
import { useAuth } from '../context/AuthContext';
import { authService } from '../utils/supabase';
import StockSearch from './stock/StockSearch';
import marketDataService from '../services/marketDataService';
import './TradingDashboard.css';

const TradingDashboard = () => {
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockQuote, setStockQuote] = useState(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  
  // Get real user data from auth context
  const { user: authUser } = useAuth();
  const authUserProfile = authUser;

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const adminStatus = await authService.isAdmin();
      setIsAdmin(adminStatus);
      
      const { data: profile } = await authService.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to check user profile:', error);
    }
  };

  const user = {
    name: (userProfile?.email || authUserProfile?.fullName || 'Unnamed Trader'),
    avatar: authUserProfile?.avatarUrl || null
  };

  const portfolioData = {
    totalValue: authUserProfile?.currentBalance || 100000,
    dailyChange: 0 // TODO: Calculate daily change from trades
  };

  const handleNavigate = (item) => {
    setActiveNavItem(item.id);
    console.log('Navigate to:', item);
  };

  const handleStockSelect = async (stock) => {
    setSelectedStock(stock);
    setIsLoadingQuote(true);
    
    try {
      const quote = await marketDataService.getStockQuote(stock.symbol);
      if (quote.success) {
        setStockQuote(quote.data);
      } else {
        console.error('Failed to fetch quote:', quote.error);
        setStockQuote(null);
      }
    } catch (error) {
      console.error('Quote fetch error:', error);
      setStockQuote(null);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  // Show admin dashboard if user is admin and admin nav is selected
  if (activeNavItem === 'admin' && isAdmin) {
    return (
      <Layout
        user={user}
        totalPortfolioValue={portfolioData.totalValue}
        dailyChange={portfolioData.dailyChange}
        activeNavItem={activeNavItem}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
      >
        <PageWrapper
          title="Admin Dashboard"
          subtitle="Manage users and system settings"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Admin' }
          ]}
        >
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h3>Admin Dashboard</h3>
            <p>Admin features coming soon...</p>
          </div>
        </PageWrapper>
      </Layout>
    );
  }

  // Mock dashboard data
  const stockCards = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.42, change: 2.1 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2845.73, change: -0.8 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 1.5 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.67, change: 3.2 }
  ];

  return (
    <Layout
      user={user}
      totalPortfolioValue={portfolioData.totalValue}
      dailyChange={portfolioData.dailyChange}
      activeNavItem={activeNavItem}
      onNavigate={handleNavigate}
    >
      <PageWrapper
        title="Trading Dashboard"
        subtitle="Welcome back! Here's your portfolio overview."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Dashboard' }
        ]}
        actions={
          <div className="dashboard-actions">
            <StockSearch onStockSelect={handleStockSelect} />
            <button className="demo-button">
              New Trade
            </button>
          </div>
        }
      >
        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Selected Stock Quote */}
          {selectedStock && (
            <div className="selected-stock-card">
              <div className="selected-stock-header">
                <div>
                  <h3>{selectedStock.symbol}</h3>
                  <p>{selectedStock.name}</p>
                </div>
                <div className="market-status">
                  {marketDataService.getMarketStatus().status}
                </div>
              </div>
              
              {isLoadingQuote ? (
                <div className="loading-quote">
                  <div className="spinner"></div>
                  <span>Loading quote...</span>
                </div>
              ) : stockQuote ? (
                <div className="stock-quote-details">
                  <div className="quote-main">
                    <div className="quote-price">{stockQuote.formattedPrice}</div>
                    <div className={`quote-change ${stockQuote.isGainer ? 'positive' : stockQuote.isLoser ? 'negative' : ''}`}>
                      {stockQuote.formattedChange} ({marketDataService.formatPercentage(stockQuote.changePercent)})
                    </div>
                  </div>
                  <div className="quote-meta">
                    <div className="quote-stat">
                      <span>Open:</span>
                      <span>{marketDataService.formatCurrency(stockQuote.open)}</span>
                    </div>
                    <div className="quote-stat">
                      <span>High:</span>
                      <span>{marketDataService.formatCurrency(stockQuote.high)}</span>
                    </div>
                    <div className="quote-stat">
                      <span>Low:</span>
                      <span>{marketDataService.formatCurrency(stockQuote.low)}</span>
                    </div>
                    <div className="quote-stat">
                      <span>Volume:</span>
                      <span>{stockQuote.formattedVolume}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="quote-error">
                  Failed to load quote data
                </div>
              )}
            </div>
          )}

          {/* Portfolio Summary */}
          <div className="portfolio-summary-card">
            <h2>Portfolio Value</h2>
            <div className="portfolio-value">
              ${portfolioData.totalValue.toLocaleString()}
            </div>
            <div className={`daily-change ${portfolioData.dailyChange >= 0 ? 'positive' : 'negative'}`}>
              {portfolioData.dailyChange >= 0 ? '+' : ''}{portfolioData.dailyChange}%
            </div>
          </div>

          {/* Stock Cards Grid */}
          <ResponsiveGrid
            mobileColumns="1fr"
            tabletColumns="1fr 1fr"
            desktopColumns="repeat(4, 1fr)"
            className="stocks-grid"
          >
            {stockCards.map(stock => (
              <div key={stock.symbol} className="stock-card">
                <div className="stock-header">
                  <h3>{stock.symbol}</h3>
                  <span className="stock-name">{stock.name}</span>
                </div>
                <div className="stock-price">${stock.price}</div>
                <div className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </div>
              </div>
            ))}
          </ResponsiveGrid>

          {/* Demo Info */}
          <div className="demo-info">
            <h3>🎉 Layout Components Complete!</h3>
            <p>
              All base layout components have been successfully implemented:
            </p>
            <ul>
              <li>✅ Responsive Grid System</li>
              <li>✅ Navigation Header</li>
              <li>✅ Collapsible Sidebar</li>
              <li>✅ Mobile Bottom Navigation</li>
              <li>✅ Page Layout Wrapper</li>
            </ul>
            <p>
              Try resizing your browser window to see the responsive behavior!
              On mobile devices, you'll see the bottom navigation instead of the sidebar.
            </p>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default TradingDashboard;