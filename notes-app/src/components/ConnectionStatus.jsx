import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import realTimeDataService from '../services/realTimeDataService';
import './ConnectionStatus.css';

const ConnectionStatus = ({ showDetails = false, className = '' }) => {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [subscribedSymbols, setSubscribedSymbols] = useState([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Subscribe to connection state changes
    const unsubscribeConnection = realTimeDataService.on('connectionStateChanged', (data) => {
      setConnectionState(data.state);
      if (data.attempt) {
        setReconnectAttempts(data.attempt);
      } else if (data.state === 'connected') {
        setReconnectAttempts(0);
      }
    });

    // Subscribe to network state changes
    const unsubscribeNetwork = realTimeDataService.on('networkStateChanged', (data) => {
      setIsOnline(data.isOnline);
    });

    // Subscribe to price updates
    const unsubscribePriceUpdate = realTimeDataService.on('priceUpdateCompleted', (data) => {
      setLastUpdateTime(data.timestamp);
    });

    // Subscribe to symbol changes
    const unsubscribeSymbolAdded = realTimeDataService.on('symbolSubscribed', () => {
      const state = realTimeDataService.getConnectionState();
      setSubscribedSymbols(state.subscribedSymbols);
    });

    const unsubscribeSymbolRemoved = realTimeDataService.on('symbolUnsubscribed', () => {
      const state = realTimeDataService.getConnectionState();
      setSubscribedSymbols(state.subscribedSymbols);
    });

    // Initialize state
    const initialState = realTimeDataService.getConnectionState();
    setConnectionState(initialState.state);
    setIsOnline(initialState.isOnline);
    setLastUpdateTime(initialState.lastUpdateTime);
    setSubscribedSymbols(initialState.subscribedSymbols);
    setReconnectAttempts(initialState.reconnectAttempts);

    // Cleanup
    return () => {
      unsubscribeConnection();
      unsubscribeNetwork();
      unsubscribePriceUpdate();
      unsubscribeSymbolAdded();
      unsubscribeSymbolRemoved();
    };
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return 'var(--accent-red)';
    
    switch (connectionState) {
      case 'connected':
        return 'var(--accent-green)';
      case 'connecting':
      case 'reconnecting':
        return 'var(--accent-gold)';
      case 'disconnected':
      default:
        return 'var(--accent-red)';
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    
    switch (connectionState) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return `Reconnecting... (${reconnectAttempts}/5)`;
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) return '🔌';
    
    switch (connectionState) {
      case 'connected':
        return '🟢';
      case 'connecting':
      case 'reconnecting':
        return '🟡';
      case 'disconnected':
      default:
        return '🔴';
    }
  };

  const handleReconnect = () => {
    if (connectionState === 'disconnected' && isOnline) {
      realTimeDataService.connect();
    }
  };

  const formatLastUpdate = () => {
    if (!lastUpdateTime) return 'Never';
    
    const now = Date.now();
    const diff = now - lastUpdateTime;
    
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(lastUpdateTime).toLocaleTimeString();
  };

  return (
    <div 
      className={`connection-status ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.div 
        className="status-indicator"
        initial={{ scale: 0.8 }}
        animate={{ 
          scale: connectionState === 'connecting' || connectionState === 'reconnecting' ? [0.8, 1.2, 0.8] : 1,
          transition: { 
            duration: connectionState === 'connecting' || connectionState === 'reconnecting' ? 1.5 : 0.3,
            repeat: connectionState === 'connecting' || connectionState === 'reconnecting' ? Infinity : 0
          }
        }}
        style={{ color: getStatusColor() }}
      >
        <span className="status-icon" role="img" aria-label="Connection status">
          {getStatusIcon()}
        </span>
        <span className="status-text">{getStatusText()}</span>
      </motion.div>

      {showDetails && (
        <div className="connection-details">
          <div className="detail-item">
            <span className="detail-label">Symbols:</span>
            <span className="detail-value">{subscribedSymbols.length}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Last Update:</span>
            <span className="detail-value">{formatLastUpdate()}</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="status-tooltip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="tooltip-header">
              <span className="tooltip-title">Market Data Connection</span>
              <span className="tooltip-status" style={{ color: getStatusColor() }}>
                {getStatusText()}
              </span>
            </div>
            
            <div className="tooltip-details">
              <div className="tooltip-item">
                <span>Network:</span>
                <span style={{ color: isOnline ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="tooltip-item">
                <span>Subscriptions:</span>
                <span>{subscribedSymbols.length} symbols</span>
              </div>
              
              <div className="tooltip-item">
                <span>Last Update:</span>
                <span>{formatLastUpdate()}</span>
              </div>

              {subscribedSymbols.length > 0 && (
                <div className="tooltip-symbols">
                  <span>Watching:</span>
                  <div className="symbols-list">
                    {subscribedSymbols.slice(0, 5).map(symbol => (
                      <span key={symbol} className="symbol-tag">{symbol}</span>
                    ))}
                    {subscribedSymbols.length > 5 && (
                      <span className="symbol-tag">+{subscribedSymbols.length - 5} more</span>
                    )}
                  </div>
                </div>
              )}

              {connectionState === 'disconnected' && isOnline && (
                <button 
                  className="reconnect-button"
                  onClick={handleReconnect}
                >
                  Reconnect
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectionStatus;