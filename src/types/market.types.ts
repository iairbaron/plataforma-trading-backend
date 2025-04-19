export interface MarketData {
  symbol: string;
  name: string;
  type: 'STOCK' | 'CRYPTO' | 'FOREX';
  currentPrice: number;
  dailyChange: number;
  weeklyChange: number;
  lastUpdated: string;
}

export interface DetailedMarketData extends MarketData {
  high: number;
  low: number;
  volume: number;
  open: number;
  previousClose: number;
}

export interface AlphaVantageQuote {
  "Global Quote": {
    "01. symbol": string;
    "02. open": string;
    "03. high": string;
    "04. low": string;
    "05. price": string;
    "06. volume": string;
    "07. latest trading day": string;
    "08. previous close": string;
    "09. change": string;
    "10. change percent": string;
  }
}

export interface AlphaVantageWeekly {
  "Weekly Time Series": {
    [key: string]: {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    }
  }
  "Meta Data": {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
  }
} 