// Market Data Service Layer for TSX Trading Simulator
// Provides high-level market data functionality with caching and error handling

import { stockApi } from '../utils/stockApi';

class MarketDataService {
  constructor() {
    this.subscriptions = new Map();
    this.priceUpdateInterval = null;
    this.watchlist = new Set();
  }

  // Stock Search with enhanced error handling
  async searchStocks(query) {
    if (!query || query.trim().length < 1) {
      return {
        success: false,
        data: [],
        error: 'Search query must be at least 1 character'
      };
    }

    try {
      const result = await stockApi.searchStocks(query.trim());
      
      // Add popular stocks if search is generic
      if (query.trim().length <= 2) {
        const popularStocks = stockApi.getPopularTsxStocks()
          .filter(stock => 
            stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
            stock.name.toLowerCase().includes(query.toLowerCase())
          )
          .map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            type: 'Equity',
            region: 'Canada',
            currency: 'CAD',
            matchScore: 0.9
          }));

        if (popularStocks.length > 0) {
          result.data = [...popularStocks, ...result.data];
        }
      }

      return result;
    } catch (error) {
      console.error('Market data search error:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // Get stock quote with validation
  async getStockQuote(symbol) {
    if (!symbol) {
      return {
        success: false,
        data: null,
        error: 'Symbol is required'
      };
    }

    try {
      const result = await stockApi.getQuote(symbol);
      
      if (result.success && result.data) {
        // Add derived metrics
        result.data.isGainer = result.data.change > 0;
        result.data.isLoser = result.data.change < 0;
        result.data.formattedChange = this.formatCurrency(result.data.change);
        result.data.formattedPrice = this.formatCurrency(result.data.price);
        result.data.formattedVolume = this.formatNumber(result.data.volume);
      }

      return result;
    } catch (error) {
      console.error('Quote fetch error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  // Get multiple stock quotes
  async getMultipleQuotes(symbols) {
    if (!Array.isArray(symbols) || symbols.length === 0) {
      return {
        success: false,
        data: {},
        error: 'Symbols array is required'
      };
    }

    const results = {};
    const errors = [];

    // Process quotes with delay to respect rate limits
    for (const symbol of symbols) {
      try {
        const quote = await this.getStockQuote(symbol);
        results[symbol] = quote;
        
        if (!quote.success) {
          errors.push(`${symbol}: ${quote.error}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errors.push(`${symbol}: ${error.message}`);
        results[symbol] = {
          success: false,
          data: null,
          error: error.message
        };
      }
    }

    return {
      success: errors.length === 0,
      data: results,
      error: errors.length > 0 ? errors.join('; ') : null
    };
  }

  // Get chart data with different time periods
  async getChartData(symbol, period = '1D', interval = '5min') {
    if (!symbol) {
      return {
        success: false,
        data: [],
        error: 'Symbol is required'
      };
    }

    try {
      let result;

      switch (period) {
        case '1D':
          result = await stockApi.getIntradayData(symbol, interval);
          break;
        case '5D':
        case '1M':
        case '3M':
        case '6M':
        case '1Y':
        case 'MAX':
          result = await stockApi.getDailyData(symbol, 'full');
          if (result.success) {
            result.data = this.filterDataByPeriod(result.data, period);
          }
          break;
        default:
          result = await stockApi.getIntradayData(symbol, '5min');
      }

      return result;
    } catch (error) {
      console.error('Chart data fetch error:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // Filter historical data by time period
  filterDataByPeriod(data, period) {
    if (!data || data.length === 0) return data;

    const now = Date.now() / 1000;
    let cutoffTime;

    switch (period) {
      case '5D':
        cutoffTime = now - (5 * 24 * 60 * 60);
        break;
      case '1M':
        cutoffTime = now - (30 * 24 * 60 * 60);
        break;
      case '3M':
        cutoffTime = now - (90 * 24 * 60 * 60);
        break;
      case '6M':
        cutoffTime = now - (180 * 24 * 60 * 60);
        break;
      case '1Y':
        cutoffTime = now - (365 * 24 * 60 * 60);
        break;
      case 'MAX':
        return data;
      default:
        cutoffTime = now - (24 * 60 * 60); // 1 day default
    }

    return data.filter(point => point.time >= cutoffTime);
  }

  // Watchlist management
  addToWatchlist(symbol) {
    this.watchlist.add(symbol.toUpperCase());
    this.saveWatchlistToLocalStorage();
  }

  removeFromWatchlist(symbol) {
    this.watchlist.delete(symbol.toUpperCase());
    this.saveWatchlistToLocalStorage();
  }

  getWatchlist() {
    return Array.from(this.watchlist);
  }

  isInWatchlist(symbol) {
    return this.watchlist.has(symbol.toUpperCase());
  }

  clearWatchlist() {
    this.watchlist.clear();
    this.saveWatchlistToLocalStorage();
  }

  // Load watchlist from localStorage
  loadWatchlistFromLocalStorage() {
    try {
      const saved = localStorage.getItem('tsx_watchlist');
      if (saved) {
        const watchlistArray = JSON.parse(saved);
        this.watchlist = new Set(watchlistArray);
      }
    } catch (error) {
      console.error('Failed to load watchlist:', error);
      this.watchlist = new Set();
    }
  }

  // Save watchlist to localStorage
  saveWatchlistToLocalStorage() {
    try {
      const watchlistArray = Array.from(this.watchlist);
      localStorage.setItem('tsx_watchlist', JSON.stringify(watchlistArray));
    } catch (error) {
      console.error('Failed to save watchlist:', error);
    }
  }

  // Get trending/popular TSX stocks
  getPopularStocks() {
    return stockApi.getPopularTsxStocks();
  }

  // Price formatting utilities
  formatCurrency(value, currency = 'CAD') {
    if (typeof value !== 'number' || isNaN(value)) return '$0.00';
    
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatNumber(value) {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    
    return value.toLocaleString();
  }

  formatPercentage(value) {
    if (typeof value !== 'number' || isNaN(value)) return '0.00%';
    
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  // Market status (simplified for TSX)
  getMarketStatus() {
    const now = new Date();
    const torontoTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Toronto"}));
    const hour = torontoTime.getHours();
    const day = torontoTime.getDay();

    // TSX is open Monday-Friday 9:30 AM - 4:00 PM ET
    const isWeekend = day === 0 || day === 6;
    const isMarketHours = hour >= 9.5 && hour < 16;

    if (isWeekend) {
      return { isOpen: false, status: 'Closed (Weekend)' };
    } else if (isMarketHours) {
      return { isOpen: true, status: 'Open' };
    } else if (hour < 9.5) {
      return { isOpen: false, status: 'Pre-Market' };
    } else {
      return { isOpen: false, status: 'After Hours' };
    }
  }

  // Real-time price updates (polling-based)
  startPriceUpdates(symbols, callback, intervalMs = 60000) {
    this.stopPriceUpdates();
    
    const updatePrices = async () => {
      try {
        const quotes = await this.getMultipleQuotes(symbols);
        callback(quotes);
      } catch (error) {
        console.error('Price update error:', error);
        callback({ success: false, error: error.message });
      }
    };

    // Initial update
    updatePrices();
    
    // Set up interval
    this.priceUpdateInterval = setInterval(updatePrices, intervalMs);
  }

  stopPriceUpdates() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }
  }

  // Clean up resources
  destroy() {
    this.stopPriceUpdates();
    stockApi.clearCache();
  }
}

// Create singleton instance
const marketDataService = new MarketDataService();

// Load watchlist on initialization
marketDataService.loadWatchlistFromLocalStorage();

export default marketDataService;