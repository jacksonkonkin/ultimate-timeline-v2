// Real-time Data Service for Stock Trading Simulator
// Provides WebSocket-like functionality using enhanced polling with event broadcasting

import marketDataService from './marketDataService';

class RealTimeDataService {
  constructor() {
    // Connection state management
    this.connectionState = 'disconnected'; // 'connecting', 'connected', 'reconnecting', 'disconnected'
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second, exponential backoff
    
    // Price update management
    this.subscribedSymbols = new Set();
    this.priceUpdateInterval = null;
    this.updateIntervalMs = 30000; // 30 seconds for free tier
    this.lastUpdateTime = null;
    
    // Event listeners for broadcasting
    this.listeners = new Map();
    
    // Network state monitoring
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
    
    // Connection heartbeat
    this.heartbeatInterval = null;
    this.lastHeartbeat = null;
  }

  // Connection Management
  async connect() {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    this.setConnectionState('connecting');
    this.emit('connectionStateChanged', { state: 'connecting', timestamp: Date.now() });

    try {
      // Test connection with a quick API call
      const testResult = await marketDataService.getMarketStatus();
      
      if (testResult) {
        this.setConnectionState('connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connectionStateChanged', { 
          state: 'connected', 
          timestamp: Date.now(),
          message: 'Successfully connected to market data service'
        });
        
        // Start price updates if we have subscribed symbols
        if (this.subscribedSymbols.size > 0) {
          this.startPriceUpdates();
        }
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      this.setConnectionState('disconnected');
      this.emit('connectionStateChanged', { 
        state: 'disconnected', 
        timestamp: Date.now(),
        error: error.message 
      });
      
      // Attempt reconnection
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.setConnectionState('disconnected');
    this.stopPriceUpdates();
    this.stopHeartbeat();
    this.emit('connectionStateChanged', { 
      state: 'disconnected', 
      timestamp: Date.now(),
      message: 'Disconnected by user'
    });
  }

  async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('connectionStateChanged', { 
        state: 'disconnected', 
        timestamp: Date.now(),
        error: 'Max reconnection attempts reached'
      });
      return;
    }

    this.reconnectAttempts++;
    this.setConnectionState('reconnecting');
    this.emit('connectionStateChanged', { 
      state: 'reconnecting', 
      timestamp: Date.now(),
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts
    });

    // Exponential backoff
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    await this.connect();
  }

  scheduleReconnect() {
    if (!this.isOnline) {
      console.log('Offline - postponing reconnection');
      return;
    }

    setTimeout(() => {
      if (this.connectionState === 'disconnected') {
        this.reconnect();
      }
    }, 1000);
  }

  setConnectionState(state) {
    const oldState = this.connectionState;
    this.connectionState = state;
    console.log(`Connection state changed: ${oldState} → ${state}`);
  }

  // Symbol Subscription Management
  subscribe(symbol) {
    const normalizedSymbol = symbol.toUpperCase();
    this.subscribedSymbols.add(normalizedSymbol);
    
    this.emit('symbolSubscribed', { 
      symbol: normalizedSymbol, 
      timestamp: Date.now(),
      totalSubscriptions: this.subscribedSymbols.size
    });

    // If connected and this is the first subscription, start updates
    if (this.connectionState === 'connected' && !this.priceUpdateInterval) {
      this.startPriceUpdates();
    }

    console.log(`Subscribed to ${normalizedSymbol}. Total subscriptions: ${this.subscribedSymbols.size}`);
  }

  unsubscribe(symbol) {
    const normalizedSymbol = symbol.toUpperCase();
    const wasSubscribed = this.subscribedSymbols.has(normalizedSymbol);
    this.subscribedSymbols.delete(normalizedSymbol);

    if (wasSubscribed) {
      this.emit('symbolUnsubscribed', { 
        symbol: normalizedSymbol, 
        timestamp: Date.now(),
        totalSubscriptions: this.subscribedSymbols.size
      });

      // If no more subscriptions, stop updates
      if (this.subscribedSymbols.size === 0) {
        this.stopPriceUpdates();
      }

      console.log(`Unsubscribed from ${normalizedSymbol}. Total subscriptions: ${this.subscribedSymbols.size}`);
    }
  }

  getSubscriptions() {
    return Array.from(this.subscribedSymbols);
  }

  // Price Update Broadcasting
  async startPriceUpdates() {
    if (this.priceUpdateInterval || this.subscribedSymbols.size === 0) {
      return;
    }

    console.log(`Starting price updates for ${this.subscribedSymbols.size} symbols`);
    this.emit('priceUpdatesStarted', { 
      symbols: Array.from(this.subscribedSymbols),
      intervalMs: this.updateIntervalMs,
      timestamp: Date.now()
    });

    const updatePrices = async () => {
      if (!this.isOnline) {
        console.log('Offline - skipping price update');
        return;
      }

      if (this.connectionState !== 'connected') {
        console.log('Not connected - skipping price update');
        return;
      }

      try {
        this.emit('priceUpdateStarted', { timestamp: Date.now() });
        
        const symbols = Array.from(this.subscribedSymbols);
        const quotes = await marketDataService.getMultipleQuotes(symbols);
        
        this.lastUpdateTime = Date.now();
        
        if (quotes.success) {
          // Broadcast individual price updates
          Object.entries(quotes.data).forEach(([symbol, quoteResult]) => {
            if (quoteResult.success && quoteResult.data) {
              this.emit('priceUpdate', {
                symbol,
                data: quoteResult.data,
                timestamp: this.lastUpdateTime
              });
            }
          });

          // Broadcast batch update
          this.emit('priceUpdateCompleted', {
            quotes: quotes.data,
            timestamp: this.lastUpdateTime,
            symbolsUpdated: Object.keys(quotes.data).length
          });
        } else {
          throw new Error(quotes.error || 'Unknown price update error');
        }
      } catch (error) {
        console.error('Price update error:', error);
        this.emit('priceUpdateError', { 
          error: error.message, 
          timestamp: Date.now()
        });

        // If it's a connection error, attempt reconnection
        if (error.message.includes('API') || error.message.includes('network')) {
          this.setConnectionState('disconnected');
          this.scheduleReconnect();
        }
      }
    };

    // Initial update
    updatePrices();
    
    // Set up interval
    this.priceUpdateInterval = setInterval(updatePrices, this.updateIntervalMs);
  }

  stopPriceUpdates() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
      this.emit('priceUpdatesStopped', { timestamp: Date.now() });
      console.log('Price updates stopped');
    }
  }

  // Connection Health Monitoring
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(async () => {
      try {
        const marketStatus = await marketDataService.getMarketStatus();
        this.lastHeartbeat = Date.now();
        this.emit('heartbeat', { 
          timestamp: this.lastHeartbeat,
          marketStatus 
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
        this.emit('heartbeatFailed', { 
          error: error.message,
          timestamp: Date.now()
        });
        
        // Connection might be lost
        if (this.connectionState === 'connected') {
          this.setConnectionState('disconnected');
          this.scheduleReconnect();
        }
      }
    }, 60000); // Heartbeat every minute
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Network State Management
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.isOnline = true;
      this.emit('networkStateChanged', { 
        isOnline: true, 
        timestamp: Date.now() 
      });
      
      // Attempt to reconnect if we were disconnected
      if (this.connectionState === 'disconnected') {
        setTimeout(() => this.connect(), 1000);
      }
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.isOnline = false;
      this.emit('networkStateChanged', { 
        isOnline: false, 
        timestamp: Date.now() 
      });
      
      // Stop updates and set appropriate state
      this.stopPriceUpdates();
      if (this.connectionState === 'connected') {
        this.setConnectionState('disconnected');
      }
    });
  }

  // Event Broadcasting System
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility Methods
  getConnectionState() {
    return {
      state: this.connectionState,
      isOnline: this.isOnline,
      subscribedSymbols: Array.from(this.subscribedSymbols),
      lastUpdateTime: this.lastUpdateTime,
      lastHeartbeat: this.lastHeartbeat,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Data Synchronization
  async syncData() {
    if (this.connectionState !== 'connected' || !this.isOnline) {
      return {
        success: false,
        error: 'Not connected or offline'
      };
    }

    try {
      this.emit('syncStarted', { timestamp: Date.now() });
      
      // Force update all subscribed symbols
      if (this.subscribedSymbols.size > 0) {
        const symbols = Array.from(this.subscribedSymbols);
        const quotes = await marketDataService.getMultipleQuotes(symbols);
        
        this.emit('syncCompleted', {
          quotes: quotes.data,
          timestamp: Date.now(),
          success: quotes.success
        });

        return quotes;
      }

      return {
        success: true,
        data: {},
        message: 'No symbols to sync'
      };
    } catch (error) {
      this.emit('syncError', { 
        error: error.message,
        timestamp: Date.now()
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cleanup
  destroy() {
    this.disconnect();
    this.stopHeartbeat();
    this.listeners.clear();
    
    // Remove network listeners
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }
}

// Create singleton instance
const realTimeDataService = new RealTimeDataService();

export default realTimeDataService;

// Export convenience methods
export const {
  connect,
  disconnect,
  subscribe,
  unsubscribe,
  getConnectionState,
  syncData,
  on,
  off,
  emit
} = realTimeDataService;