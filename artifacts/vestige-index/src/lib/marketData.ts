// Vestige Index - Multi-source market data with caching
// Sources: Binance (primary), CoinGecko (fallback)
// Cache: 30min for CoinGecko, 30s for Binance

const BINANCE_API = "https://api.binance.com/api/v3";
const COINGECKO_API = "https://api.coingecko.com/api/v3";

// In-memory cache
let binanceCache: {
  prices: Record<string, { price: number; change: number; volume: number }>;
  timestamp: number;
} | null = null;

let coinGeckoCache: {
  tokens: any[];
  timestamp: number;
} | null = null;

const CACHE_BINANCE = 30 * 1000; // 30 seconds
const CACHE_COINGECKO = 30 * 60 * 1000; // 30 minutes

export interface TokenData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  market_cap: number;
  market_cap_rank: number;
  sparkline_in_7d?: { price: number[] };
}

// Get Binance prices (fast, update every 30s)
export async function getBinancePrices(): Promise<Record<string, { price: number; change: number; volume: number }>> {
  // Check cache
  if (binanceCache && Date.now() - binanceCache.timestamp < CACHE_BINANCE) {
    return binanceCache.prices;
  }

  try {
    const response = await fetch(`${BINANCE_API}/ticker/24hr`);
    const data = await response.json();

    const prices: Record<string, { price: number; change: number; volume: number }> = {};
    
    for (const item of data) {
      if (item.symbol.endsWith("USDT")) {
        const symbol = item.symbol.replace("USDT", "");
        prices[symbol] = {
          price: parseFloat(item.lastPrice),
          change: parseFloat(item.priceChangePercent),
          volume: parseFloat(item.quoteVolume),
        };
      }
    }

    // Update cache
    binanceCache = { prices, timestamp: Date.now() };
    return prices;
  } catch (error) {
    console.error("Binance API error:", error);
    return binanceCache?.prices || {};
  }
}

// Get CoinGecko top tokens (slow, cache for 30min)
export async function getCoinGeckoTop250(page = 1): Promise<any[]> {
  // Check cache
  if (coinGeckoCache && Date.now() - coinGeckoCache.timestamp < CACHE_COINGECKO && page === 1) {
    return coinGeckoCache.tokens;
  }

  try {
    const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false&price_change_percentage=1h,24h,7d,30d`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko error: ${response.status}`);
    }
    
    const data = await response.json();

    // Cache first page
    if (page === 1) {
      coinGeckoCache = { tokens: data, timestamp: Date.now() };
    }
    
    return data;
  } catch (error) {
    console.error("CoinGecko API error:", error);
    return coinGeckoCache?.tokens || [];
  }
}

// Main function: Get Top 1000 with combined data
export async function getMarketData(): Promise<TokenData[]> {
  const binancePrices = await getBinancePrices();
  const geckoTokens = await getCoinGeckoTop250();
  
  // Build combined list
  const result: TokenData[] = [];
  const seenSymbols = new Set<string>();

  // 1. First add all Binance pairs (they have better liquidity)
  for (const [symbol, data] of Object.entries(binancePrices)) {
    if (!seenSymbols.has(symbol) && result.length < 1000) {
      seenSymbols.add(symbol);
      result.push({
        id: symbol.toLowerCase(),
        symbol: symbol,
        name: symbol,
        image: `https://assets.coingecko.com/coins/images/1/small/${symbol.toLowerCase()}.png`,
        current_price: data.price,
        price_change_percentage_24h: data.change,
        total_volume: data.volume,
        market_cap: data.price * data.volume,
        market_cap_rank: result.length + 1,
      });
    }
  }

  // 2. Fill rest with CoinGecko data
  for (const token of geckoTokens) {
    if (!seenSymbols.has(token.symbol.toUpperCase()) && result.length < 1000) {
      seenSymbols.add(token.symbol.toUpperCase());
      result.push({
        id: token.id,
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        image: token.image,
        current_price: token.current_price,
        price_change_percentage_24h: token.price_change_percentage_24h || 0,
        price_change_percentage_7d_in_currency: token.price_change_percentage_7d_in_currency,
        total_volume: token.total_volume,
        market_cap: token.market_cap,
        market_cap_rank: token.market_cap_rank,
        sparkline_in_7d: token.sparkline_in_7d,
      });
    }
  }

  return result;
}

// Get prices for specific symbols (fast, uses Binance)
export async function getPricesForSymbols(symbols: string[]): Promise<Record<string, number>> {
  const binancePrices = await getBinancePrices();
  const result: Record<string, number> = {};

  for (const symbol of symbols) {
    if (binancePrices[symbol.toUpperCase()]) {
      result[symbol.toUpperCase()] = binancePrices[symbol.toUpperCase()].price;
    } else if (binancePrices[symbol]) {
      result[symbol] = binancePrices[symbol].price;
    }
  }

  return result;
}

// Legacy exports for compatibility
export interface CMCToken {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      percent_change_24h: number;
      market_cap: number;
    };
  };
}

export interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

export interface EnrichedToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  market_cap_rank: number;
}

export async function getEnrichedMarketData(): Promise<EnrichedToken[]> {
  const data = await getMarketData();
  return data.map(t => ({
    id: t.id,
    symbol: t.symbol,
    name: t.name,
    image: t.image,
    current_price: t.current_price,
    price_change_percentage_24h: t.price_change_percentage_24h,
    total_volume: t.total_volume,
    market_cap: t.market_cap,
    market_cap_rank: t.market_cap_rank,
  }));
}

export async function getAllBinancePrices(): Promise<BinanceTicker[]> {
  try {
    const response = await fetch(`${BINANCE_API}/ticker/24hr`);
    return await response.json();
  } catch {
    return [];
  }
}