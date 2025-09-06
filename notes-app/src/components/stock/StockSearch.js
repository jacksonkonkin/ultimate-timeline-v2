import React, { useState, useEffect, useRef, useCallback } from 'react';
import marketDataService from '../../services/marketDataService';
import './StockSearch.css';

const StockSearch = ({ onStockSelect, placeholder = "Search TSX stocks..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const timeoutRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await marketDataService.searchStocks(searchQuery);
        
        if (response.success) {
          setResults(response.data);
          setIsOpen(response.data.length > 0);
        } else {
          setError(response.error);
          setResults([]);
          setIsOpen(false);
        }
      } catch (err) {
        setError(err.message);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Handle search input changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      debouncedSearch(query);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debouncedSearch]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  };

  // Handle stock selection
  const handleStockSelect = (stock) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    onStockSelect(stock);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleStockSelect(results[selectedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
      
      default:
        break;
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show popular stocks when input is focused and empty
  const handleFocus = async () => {
    if (!query.trim()) {
      const popularStocks = marketDataService.getPopularStocks().map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        type: 'Popular',
        region: 'Canada',
        currency: 'CAD',
        matchScore: 1.0
      }));
      
      setResults(popularStocks.slice(0, 8)); // Show top 8
      setIsOpen(true);
    }
  };

  return (
    <div className="stock-search" ref={searchRef}>
      <div className="stock-search__input-container">
        <input
          type="text"
          className="stock-search__input"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="stock-search__loading">
            <div className="spinner"></div>
          </div>
        )}
        
        <div className="stock-search__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="stock-search__dropdown" ref={resultsRef}>
          {error ? (
            <div className="stock-search__error">
              <div className="stock-search__error-icon">⚠️</div>
              <div className="stock-search__error-message">{error}</div>
            </div>
          ) : results.length > 0 ? (
            <>
              {!query.trim() && (
                <div className="stock-search__section-title">Popular TSX Stocks</div>
              )}
              {results.map((stock, index) => (
                <div
                  key={`${stock.symbol}-${index}`}
                  className={`stock-search__result ${
                    index === selectedIndex ? 'stock-search__result--selected' : ''
                  }`}
                  onClick={() => handleStockSelect(stock)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="stock-search__result-main">
                    <div className="stock-search__symbol">{stock.symbol}</div>
                    <div className="stock-search__name">{stock.name}</div>
                  </div>
                  <div className="stock-search__result-meta">
                    <div className="stock-search__type">{stock.type}</div>
                    {stock.currency && (
                      <div className="stock-search__currency">{stock.currency}</div>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : query.trim() && !isLoading ? (
            <div className="stock-search__no-results">
              <div className="stock-search__no-results-icon">🔍</div>
              <div className="stock-search__no-results-message">
                No TSX stocks found for "{query}"
              </div>
              <div className="stock-search__no-results-tip">
                Try searching by company name or ticker symbol
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StockSearch;