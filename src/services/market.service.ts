import axios from 'axios';

// Cache structure
interface StockCache {
  data: any;
  timestamp: number;
}

// Cache for storing stock data
const stockCache: Record<string, StockCache> = {};

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

// List of 10 stock symbols to fetch
const STOCK_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
  'TSLA', 'NVDA', 'JPM', 'V', 'JNJ'
];

// Alpha Vantage API key
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

/**
 * Fetch stock data for the configured symbols with caching
 */
export async function fetchStockData() {
  const currentTime = Date.now();
  const results = [];

  // Process each stock symbol
  for (const symbol of STOCK_SYMBOLS) {
    // Check if we have cached data and if it's still valid
    if (
      stockCache[symbol] &&
      currentTime - stockCache[symbol].timestamp < CACHE_DURATION
    ) {
      // Use cached data
      results.push(stockCache[symbol].data);
    } else {
      // Fetch new data
      try {
        const response = await axios.get(`https://www.alphavantage.co/query`, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol,
            apikey: API_KEY
          }
        });

        if (response.data && response.data['Global Quote']) {
          const quote = response.data['Global Quote'];
          
          const stockData = {
            symbol,
            name: symbol, // For simplicity, using symbol as name
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: quote['10. change percent'].replace('%', ''),
            lastUpdated: new Date().toISOString()
          };

          // Update cache
          stockCache[symbol] = {
            data: stockData,
            timestamp: currentTime
          };

          results.push(stockData);
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
      }
    }
  }

  return results;
} 