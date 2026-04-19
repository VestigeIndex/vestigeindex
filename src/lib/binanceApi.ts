// Vestige Index - Binance API Integration
// Free, no API key required
// Docs: https://developers.binance.com/docs

const BINANCE_API_BASE = "https://api.binance.com/api/v3";

// Cache for klines data (reduce API calls)
let klinesCache: {
  data: KlineData[];
  timestamp: number;
  symbol: string;
  interval: string;
} | null = null;

const CACHE_DURATION = 60 * 1000; // 1 minute cache

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteVolume: number;
  trades: number;
}

/**
 * Fetch candles/klines for a symbol
 */
export async function getBinanceKlines(
  symbol: string = "BTC",
  interval: string = "1d",
  limit: number = 365
): Promise<KlineData[]> {
  const cacheKey = `${symbol.toUpperCase()}_${interval}`;
  
  if (
    klinesCache && 
    klinesCache.symbol === symbol.toUpperCase() && 
    klinesCache.interval === interval &&
    Date.now() - klinesCache.timestamp < CACHE_DURATION
  ) {
    return klinesCache.data;
  }

  try {
    const url = `${BINANCE_API_BASE}/klines?symbol=${symbol.toUpperCase()}USDT&interval=${interval}&limit=${limit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }
    
    const rawData = await response.json();
    
    const klines: KlineData[] = rawData.map((k: number[]) => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(String(k[1])),
      high: parseFloat(String(k[2])),
      low: parseFloat(String(k[3])),
      close: parseFloat(String(k[4])),
      volume: parseFloat(String(k[5])),
      closeTime: Math.floor(k[6] / 1000),
      quoteVolume: parseFloat(String(k[7])),
      trades: k[8] as number,
    }));

    klinesCache = {
      data: klines,
      timestamp: Date.now(),
      symbol: symbol.toUpperCase(),
      interval,
    };

    return klines;
  } catch (error) {
    console.error("getBinanceKlines error:", error);
    return klinesCache?.data || [];
  }
}

/**
 * Get current price for a symbol
 */
export async function getBinancePrice(symbol: string): Promise<number> {
  try {
    const url = `${BINANCE_API_BASE}/ticker/price?symbol=${symbol.toUpperCase()}USDT`;
    const response = await fetch(url);
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error("getBinancePrice error:", error);
    return 0;
  }
}

/**
 * Get 24h ticker data
 */
export interface Ticker24h {
  symbol: string;
  price: number;
  change: number;
  high: number;
  low: number;
  volume: number;
  quoteVolume: number;
}

export async function getBinanceTicker24h(symbol: string): Promise<Ticker24h | null> {
  try {
    const url = `${BINANCE_API_BASE}/ticker/24hr?symbol=${symbol.toUpperCase()}USDT`;
    const response = await fetch(url);
    const data = await response.json();
    return {
      symbol: data.symbol.replace("USDT", ""),
      price: parseFloat(data.lastPrice),
      change: parseFloat(data.priceChangePercent),
      high: parseFloat(data.highPrice),
      low: parseFloat(data.lowPrice),
      volume: parseFloat(data.volume),
      quoteVolume: parseFloat(data.quoteVolume),
    };
  } catch (error) {
    console.error("getBinanceTicker24h error:", error);
    return null;
  }
}

/**
 * Get all 24h tickers
 */
export async function getAllBinanceTickers(): Promise<Record<string, Ticker24h>> {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/ticker/24hr`);
    const data = await response.json();
    
    const result: Record<string, Ticker24h> = {};
    for (const item of data) {
      if (item.symbol.endsWith("USDT")) {
        const sym = item.symbol.replace("USDT", "");
        result[sym] = {
          symbol: sym,
          price: parseFloat(item.lastPrice),
          change: parseFloat(item.priceChangePercent),
          high: parseFloat(item.highPrice),
          low: parseFloat(item.lowPrice),
          volume: parseFloat(item.volume),
          quoteVolume: parseFloat(item.quoteVolume),
        };
      }
    }
    return result;
  } catch (error) {
    console.error("getAllBinanceTickers error:", error);
    return {};
  }
}

/**
 * Get order book depth
 */
export interface OrderBookEntry {
  price: number;
  qty: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdateId: number;
}

export async function getBinanceOrderBook(symbol: string, limit: number = 100): Promise<OrderBook | null> {
  try {
    const url = `${BINANCE_API_BASE}/depth?symbol=${symbol.toUpperCase()}USDT&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    return {
      bids: data.bids.map((b: string[]) => ({ price: parseFloat(b[0]), qty: parseFloat(b[1]) })),
      asks: data.asks.map((a: string[]) => ({ price: parseFloat(a[0]), qty: parseFloat(a[1]) })),
      lastUpdateId: data.lastUpdateId,
    };
  } catch (error) {
    console.error("getBinanceOrderBook error:", error);
    return null;
  }
}

/**
 * Get recent trades
 */
export interface Trade {
  id: number;
  price: number;
  qty: number;
  time: number;
  isBuyerMaker: boolean;
}

export async function getBinanceRecentTrades(symbol: string, limit: number = 50): Promise<Trade[]> {
  try {
    const url = `${BINANCE_API_BASE}/trades?symbol=${symbol.toUpperCase()}USDT&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.map((t: { id: number; price: string; qty: string; time: number; isBuyerMaker: boolean }) => ({
      id: t.id,
      price: parseFloat(t.price),
      qty: parseFloat(t.qty),
      time: t.time,
      isBuyerMaker: t.isBuyerMaker,
    }));
  } catch (error) {
    console.error("getBinanceRecentTrades error:", error);
    return [];
  }
}

/**
 * Get exchange info
 */
export async function getBinanceExchangeInfo(): Promise<any> {
  try {
    const url = `${BINANCE_API_BASE}/exchangeInfo`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("getBinanceExchangeInfo error:", error);
    return null;
  }
}

/**
 * Get server time
 */
export async function getBinanceServerTime(): Promise<number> {
  try {
    const url = `${BINANCE_API_BASE}/time`;
    const response = await fetch(url);
    const data = await response.json();
    return data.serverTime;
  } catch (error) {
    console.error("getBinanceServerTime error:", error);
    return 0;
  }
}