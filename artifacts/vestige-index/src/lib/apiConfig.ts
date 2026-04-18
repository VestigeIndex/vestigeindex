/**
 * API Configuration for Vestige Index
 * With automatic fallback when primary API fails
 */

export const API_CONFIG = {
  // Market data - CoinGecko is primary (more stable internationally)
  marketData: {
    primary: 'CoinGecko',
    fallback: 'Binance',
    timeout: 5000,
    endpoints: {
      CoinGecko: 'https://api.coingecko.com/api/v3/coins/markets',
      Binance: 'https://api.binance.com/api/v3/ticker/24hr'
    }
  },
  
  // Swap/Exchange - OpenOcean primary
  swaps: {
    primary: 'OpenOcean',
    fallback: null, // No good fallback for swaps currently
    timeout: 10000,
    endpoints: {
      OpenOcean: 'https://open-api.openocean.finance/v4'
    }
  },
  
  // News - CryptoCompare or fallback
  news: {
    primary: 'CryptoCompare',
    fallback: 'mock',
    timeout: 5000,
    endpoints: {
      CryptoCompare: 'https://min-api.cryptocompare.com/data/v2/news'
    }
  }
};

// API Service with fallback logic
export class APIService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache
  }

  async fetchWithFallback(config, params = {}) {
    const { primary, fallback, timeout, endpoints } = config;
    
    // Try primary first
    try {
      const result = await this.fetchWithTimeout(endpoints[primary], params, timeout);
      if (result) return { source: primary, data: result };
    } catch (error) {
      console.warn(`[API] ${primary} failed: ${error.message}`);
    }
    
    // Try fallback if available
    if (fallback && fallback !== 'null') {
      try {
        const result = await this.fetchWithTimeout(endpoints[fallback], params, timeout);
        if (result) return { source: fallback, data: result };
      } catch (error) {
        console.warn(`[API] ${fallback} failed: ${error.message}`);
      }
    }
    
    // Return mock data as last resort
    return { source: 'mock', data: null };
  }

  async fetchWithTimeout(url, params, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    const response = await fetch(fullUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  }
}

export const apiService = new APIService();