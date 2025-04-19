export interface Instrument {
  symbol: string;
  name: string;
  type: 'STOCK' | 'CRYPTO' | 'FOREX';
}

export const MONITORED_INSTRUMENTS: Instrument[] = [
  // Top 10 Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'STOCK' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'STOCK' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'STOCK' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'STOCK' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'STOCK' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'STOCK' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'STOCK' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'STOCK' },
  { symbol: 'V', name: 'Visa Inc.', type: 'STOCK' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'STOCK' },
  
  // Top 5 Crypto
  { symbol: 'BTC', name: 'Bitcoin USD', type: 'CRYPTO' },
  { symbol: 'ETH', name: 'Ethereum USD', type: 'CRYPTO' },
  { symbol: 'BNB', name: 'Binance Coin USD', type: 'CRYPTO' },
  { symbol: 'XRP', name: 'Ripple USD', type: 'CRYPTO' },
  { symbol: 'SOL', name: 'Solana USD', type: 'CRYPTO' },
  
  // Top 5 Forex
  { symbol: 'EUR/USD', name: 'Euro/US Dollar', type: 'FOREX' },
  { symbol: 'GBP/USD', name: 'British Pound/US Dollar', type: 'FOREX' },
  { symbol: 'USD/JPY', name: 'US Dollar/Japanese Yen', type: 'FOREX' },
  { symbol: 'USD/CHF', name: 'US Dollar/Swiss Franc', type: 'FOREX' },
  { symbol: 'AUD/USD', name: 'Australian Dollar/US Dollar', type: 'FOREX' }
]; 