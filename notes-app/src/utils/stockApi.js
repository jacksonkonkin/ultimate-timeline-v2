// Stock Data API Client for Toronto Stock Exchange (TSX)
// Using Alpha Vantage API with Canadian market support

const API_BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

// Debug logging for environment variables (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('Stock API Debug:', {
    API_KEY_CONFIGURED: !!API_KEY,
    API_KEY_LENGTH: API_KEY?.length || 0
  });
}

// Cache for API responses to reduce API calls
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class StockApiClient {
  constructor() {
    this.rateLimitDelay = 12000; // 12 seconds between calls for free tier
    this.lastApiCall = 0;
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const timeSinceLastCall = Date.now() - this.lastApiCall;
    if (timeSinceLastCall < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastApiCall = Date.now();
  }

  // Generic API call with caching
  async makeApiCall(params, cacheKey, cacheDuration = CACHE_DURATION) {
    // Check cache first
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheDuration) {
        return cached.data;
      }
    }

    // Check if API key is configured
    if (!API_KEY) {
      throw new Error('Alpha Vantage API key not configured. Please set REACT_APP_ALPHA_VANTAGE_API_KEY environment variable.');
    }

    // Rate limiting
    await this.waitForRateLimit();

    // Make API call
    const queryParams = new URLSearchParams({
      ...params,
      apikey: API_KEY
    });

    const response = await fetch(`${API_BASE_URL}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check for API errors
    if (data['Error Message']) {
      throw new Error(`API Error: ${data['Error Message']}`);
    }

    if (data['Information']) {
      throw new Error(`API Rate Limit: ${data['Information']}`);
    }

    // Cache the response
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  // Search for Canadian stocks (TSX)
  async searchStocks(query) {
    try {
      const data = await this.makeApiCall(
        {
          function: 'SYMBOL_SEARCH',
          keywords: query
        },
        `search_${query}`,
        10 * 60 * 1000 // 10 minute cache for searches
      );

      // Filter for Canadian exchanges and format results
      const canadianStocks = data.bestMatches
        ?.filter(stock => 
          stock['4. region'] === 'Canada' || 
          stock['1. symbol'].includes('.TO') ||
          stock['1. symbol'].includes('.V') ||
          stock['1. symbol'].includes('.CN')
        )
        .map(stock => ({
          symbol: stock['1. symbol'],
          name: stock['2. name'],
          type: stock['3. type'],
          region: stock['4. region'],
          marketOpen: stock['5. marketOpen'],
          marketClose: stock['6. marketClose'],
          timezone: stock['7. timezone'],
          currency: stock['8. currency'],
          matchScore: parseFloat(stock['9. matchScore'])
        }))
        .sort((a, b) => b.matchScore - a.matchScore) || [];

      return {
        success: true,
        data: canadianStocks,
        error: null
      };
    } catch (error) {
      console.error('Stock search error:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // Get real-time quote for a stock
  async getQuote(symbol) {
    try {
      // Ensure symbol has .TO suffix for TSX stocks if not already present
      const formattedSymbol = this.formatTsxSymbol(symbol);
      
      const data = await this.makeApiCall(
        {
          function: 'GLOBAL_QUOTE',
          symbol: formattedSymbol
        },
        `quote_${formattedSymbol}`,
        1 * 60 * 1000 // 1 minute cache for quotes
      );

      const quote = data['Global Quote'];
      if (!quote) {
        throw new Error('No quote data available');
      }

      return {
        success: true,
        data: {
          symbol: quote['01. symbol'],
          open: parseFloat(quote['02. open']),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          price: parseFloat(quote['05. price']),
          volume: parseInt(quote['06. volume']),
          latestTradingDay: quote['07. latest trading day'],
          previousClose: parseFloat(quote['08. previous close']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
        },
        error: null
      };
    } catch (error) {
      console.error('Quote fetch error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  // Get intraday data for charts
  async getIntradayData(symbol, interval = '5min') {
    try {
      const formattedSymbol = this.formatTsxSymbol(symbol);
      
      const data = await this.makeApiCall(
        {
          function: 'TIME_SERIES_INTRADAY',
          symbol: formattedSymbol,
          interval: interval,
          outputsize: 'compact'
        },
        `intraday_${formattedSymbol}_${interval}`,
        5 * 60 * 1000 // 5 minute cache
      );

      const timeSeries = data[`Time Series (${interval})`];
      if (!timeSeries) {
        throw new Error('No intraday data available');
      }

      const chartData = Object.entries(timeSeries)
        .map(([time, values]) => ({
          time: new Date(time).getTime() / 1000, // Unix timestamp
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        }))
        .sort((a, b) => a.time - b.time);

      return {
        success: true,
        data: chartData,
        error: null
      };
    } catch (error) {
      console.error('Intraday data fetch error:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // Get daily historical data
  async getDailyData(symbol, outputSize = 'compact') {
    try {
      const formattedSymbol = this.formatTsxSymbol(symbol);
      
      const data = await this.makeApiCall(
        {
          function: 'TIME_SERIES_DAILY',
          symbol: formattedSymbol,
          outputsize: outputSize
        },
        `daily_${formattedSymbol}_${outputSize}`,
        15 * 60 * 1000 // 15 minute cache
      );

      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('No daily data available');
      }

      const chartData = Object.entries(timeSeries)
        .map(([date, values]) => ({
          time: new Date(date).getTime() / 1000,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        }))
        .sort((a, b) => a.time - b.time);

      return {
        success: true,
        data: chartData,
        error: null
      };
    } catch (error) {
      console.error('Daily data fetch error:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  // Format symbol for TSX
  formatTsxSymbol(symbol) {
    // If symbol doesn't have an exchange suffix, assume TSX
    if (!symbol.includes('.') && !symbol.includes(':')) {
      return `${symbol}.TO`;
    }
    return symbol;
  }

  // Get popular TSX stocks
  getPopularTsxStocks() {
    return [
      { symbol: 'SHOP.TO', name: 'Shopify Inc.' },
      { symbol: 'RY.TO', name: 'Royal Bank of Canada' },
      { symbol: 'TD.TO', name: 'The Toronto-Dominion Bank' },
      { symbol: 'BMO.TO', name: 'Bank of Montreal' },
      { symbol: 'BNS.TO', name: 'The Bank of Nova Scotia' },
      { symbol: 'CNR.TO', name: 'Canadian National Railway Company' },
      { symbol: 'CP.TO', name: 'Canadian Pacific Kansas City Limited' },
      { symbol: 'ENB.TO', name: 'Enbridge Inc.' },
      { symbol: 'TRP.TO', name: 'TC Energy Corporation' },
      { symbol: 'WCN.TO', name: 'Waste Connections, Inc.' },
      { symbol: 'CNQ.TO', name: 'Canadian Natural Resources Limited' },
      { symbol: 'SU.TO', name: 'Suncor Energy Inc.' },
      { symbol: 'IMO.TO', name: 'Imperial Oil Limited' },
      { symbol: 'CVE.TO', name: 'Cenovus Energy Inc.' },
      { symbol: 'ATD.TO', name: 'Alimentation Couche-Tard Inc.' }
    ];
  }

  // Clear cache
  clearCache() {
    cache.clear();
  }

  // Get cache size for debugging
  getCacheSize() {
    return cache.size;
  }
}

// Export singleton instance
export const stockApi = new StockApiClient();

// Export individual functions for convenience
export const {
  searchStocks,
  getQuote,
  getIntradayData,
  getDailyData,
  formatTsxSymbol,
  getPopularTsxStocks,
  clearCache,
  getCacheSize
} = stockApi;

export default stockApi;