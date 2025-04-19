import axios from 'axios';
import NodeCache from 'node-cache';
import { MONITORED_INSTRUMENTS, Instrument } from '../config/instruments';
import { MarketData, DetailedMarketData, AlphaVantageQuote, AlphaVantageWeekly } from '../types/market.types';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const CACHE_TTL = 900; // 15 minutes in seconds
const LAST_UPDATE_KEY = 'last_alpha_vantage_update';

class MarketService {
  private cache: NodeCache;
  private baseUrl: string;
  private isUpdating: boolean;

  constructor() {
    this.cache = new NodeCache({ stdTTL: CACHE_TTL });
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.isUpdating = false;
  }

  private async fetchStockData(symbol: string) {
    const response = await axios.get(this.baseUrl, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    return response.data;
  }

  private async fetchCryptoData(symbol: string) {
    const response = await axios.get(this.baseUrl, {
      params: {
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: symbol,
        to_currency: 'USD',
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    return response.data;
  }

  private async fetchForexData(symbol: string) {
    const [fromCurrency, toCurrency] = symbol.split('/');
    const response = await axios.get(this.baseUrl, {
      params: {
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: fromCurrency,
        to_currency: toCurrency,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    return response.data;
  }

  private async getInstrumentData(instrument: Instrument): Promise<MarketData> {
    const cacheKey = `market_data_${instrument.symbol}`;
    const cachedData = this.cache.get<MarketData>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      let price = 0;
      let dailyChange = 0;

      switch (instrument.type) {
        case 'STOCK':
          const stockData = await this.fetchStockData(instrument.symbol);
          if (stockData['Global Quote']) {
            price = parseFloat(stockData['Global Quote']['05. price']);
            dailyChange = parseFloat(stockData['Global Quote']['09. change']);
          }
          break;

        case 'CRYPTO':
          const cryptoData = await this.fetchCryptoData(instrument.symbol);
          if (cryptoData['Realtime Currency Exchange Rate']) {
            price = parseFloat(cryptoData['Realtime Currency Exchange Rate']['5. Exchange Rate']);
            // Para crypto no tenemos cambio diario directamente
            dailyChange = 0;
          }
          break;

        case 'FOREX':
          const forexData = await this.fetchForexData(instrument.symbol);
          if (forexData['Realtime Currency Exchange Rate']) {
            price = parseFloat(forexData['Realtime Currency Exchange Rate']['5. Exchange Rate']);
            // Para forex no tenemos cambio diario directamente
            dailyChange = 0;
          }
          break;
      }

      const marketData: MarketData = {
        symbol: instrument.symbol,
        name: instrument.name,
        type: instrument.type,
        currentPrice: price,
        dailyChange: dailyChange,
        weeklyChange: 0, // Por ahora lo dejamos en 0
        lastUpdated: new Date().toISOString()
      };

      this.cache.set(cacheKey, marketData);
      return marketData;
    } catch (error) {
      console.error(`Error fetching data for ${instrument.symbol}:`, error);
      // En caso de error, devolvemos datos básicos
      return {
        symbol: instrument.symbol,
        name: instrument.name,
        type: instrument.type,
        currentPrice: 0,
        dailyChange: 0,
        weeklyChange: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async getAllInstrumentsData(): Promise<MarketData[]> {
    try {
      // Procesar los instrumentos en serie para evitar límites de rate
      const results: MarketData[] = [];
      for (const instrument of MONITORED_INSTRUMENTS) {
        try {
          const data = await this.getInstrumentData(instrument);
          results.push(data);
          // Esperar 1 segundo entre llamadas para evitar límites de rate
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error processing ${instrument.symbol}:`, error);
          // En caso de error, agregar datos básicos
          results.push({
            symbol: instrument.symbol,
            name: instrument.name,
            type: instrument.type,
            currentPrice: 0,
            dailyChange: 0,
            weeklyChange: 0,
            lastUpdated: 'N/A'
          });
        }
      }
      return results;
    } catch (error) {
      console.error('Error fetching all instruments:', error);
      throw error;
    }
  }

  async getInstrumentDetails(symbol: string): Promise<DetailedMarketData | null> {
    const instrument = MONITORED_INSTRUMENTS.find(i => i.symbol === symbol);
    if (!instrument) return null;

    try {
      const quoteData = await this.fetchStockData(symbol);
      const quote = quoteData['Global Quote'];
      const marketData = await this.getInstrumentData(instrument);

      return {
        ...marketData,
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        volume: parseInt(quote['06. volume']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close'])
      };
    } catch (error) {
      console.error(`Error fetching details for ${symbol}:`, error);
      throw error;
    }
  }

  searchInstruments(query: string): Instrument[] {
    const lowercaseQuery = query.toLowerCase();
    return MONITORED_INSTRUMENTS.filter(instrument => 
      instrument.symbol.toLowerCase().includes(lowercaseQuery) ||
      instrument.name.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const marketService = new MarketService(); 