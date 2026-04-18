// Vestige Index - Multi-source market data with fallback system
// Priority: DIA → CoinGecko → CoinCap → Binance (last fallback)

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const COINMARKETCAP_API = "https://pro-api.coinmarketcap.com/v2";
const DIADATA_API = "https://api.diadata.org/v1";
const COINCAP_API = "https://api.coincap.io/v2";
const BINANCE_API = "https://api.binance.com/api/v3";

// API Keys from environment
const COINGECKO_API_KEY = "CG-ekuLMwNLc7RbL3Km4x4NxKec";
const COINMARKETCAP_API_KEY = "c8319a304a904f709aeb6629ea0c6423";

// In-memory cache
let memoryCache: { data: any; timestamp: number } | null = null;
const MEMORY_CACHE_TTL = 30000; // 30 seconds

// LocalStorage keys for persistent caching
const CACHE_KEYS = {
  MARKET: "vestige_market_data",
  MARKET_V2: "vestige_market_cache",
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Helper functions for localStorage cache
function getCache<T>(key: string, maxAge: number): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < maxAge) {
        return data;
      }
    }
  } catch {}
  return null;
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

// Common token icons mapping
const TOKEN_ICONS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  USDT: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  USDC: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  XRP: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  ADA: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  DOT: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  UNI: "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
  ATOM: "https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png",
  LTC: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  BCH: "https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png",
  XLM: "https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png",
  NEAR: "https://assets.coingecko.com/coins/images/10365/small/near.jpg",
  ALGO: "https://assets.coingecko.com/coins/images/4030/small/download.png",
  VET: "https://assets.coingecko.com/coins/images/1167/small/VET_Token_Icon.png",
  FIL: "https://assets.coingecko.com/coins/images/12817/small/filecoin.png",
  ICP: "https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png",
  TRX: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
  XMR: "https://assets.coingecko.com/coins/images/69/small/monero_logo.png",
  ETC: "https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png",
  XTZ: "https://assets.coingecko.com/coins/images/976/small/Tezos-logo.png",
  CAKE: "https://assets.coingecko.com/coins/images/12632/small/cake.png",
  SHIB: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  PEPE: "https://assets.coingecko.com/coins/images/31053/small/pepe-token.jpeg",
  ARB: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.12.jpeg",
  OP: "https://assets.coingecko.com/coins/images/25246/small/Optimism.png",
  INJ: "https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png",
  SUI: "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg",
  AAVE: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
  MKR: "https://assets.coingecko.com/coins/images/13686/small/Mark_new_256.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
};

function getTokenImage(symbol: string): string {
  const upper = symbol.toUpperCase();
  if (TOKEN_ICONS[upper]) {
    return TOKEN_ICONS[upper];
  }
  return `https://assets.coingecko.com/coins/images/1/small/${symbol.toLowerCase()}.png`;
}

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

// Source 1: CoinGecko API
async function fetchFromCoinGecko(): Promise<TokenData[]> {
  try {
    const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h,7d`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Save to cache
    setCache(CACHE_KEYS.MARKET_V2, data);
    
    return data.map((token: any) => ({
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
    }));
  } catch (error) {
    console.error("CoinGecko API failed:", error);
    return [];
  }
}

// Source 2: CoinPaprika API (fallback)
async function fetchFromCoinPaprika(): Promise<TokenData[]> {
  try {
    const url = `${COINPAPRIKA_API}/tickers?limit=250`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinPaprika error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Save to cache
    const transformed = data.map((item: any) => ({
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      image: item?.quotes?.USD?.market_cap ? getTokenImage(item.symbol) : "",
      current_price: item?.quotes?.USD?.price || 0,
      price_change_percentage_24h: item?.quotes?.USD?.percent_change_24h || 0,
      price_change_percentage_7d_in_currency: item?.quotes?.USD?.percent_change_7d,
      total_volume: item?.quotes?.USD?.volume_24h || 0,
      market_cap: item?.quotes?.USD?.market_cap || 0,
      market_cap_rank: item?.rank || 999,
    }));
    
    setCache(CACHE_KEYS.MARKET_V2, transformed);
    
    return transformed;
  } catch (error) {
    console.error("CoinPaprika API failed:", error);
    return [];
  }
}

// Fallback: Get from localStorage cache
function getFromCache(): TokenData[] {
  const cached = getCache<TokenData[]>(CACHE_KEYS.MARKET_V2, Infinity);
  return cached || [];
}

// Main function: Get market data with multi-source fallback
export async function getMarketData(): Promise<TokenData[]> {
  return getMarketDataWithFallback();
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

// Normalize token data from any source
function normalizeToken(data: any, source: string) {
  return {
    id: data.id || data.symbol?.toLowerCase() || data.symbol,
    symbol: (data.symbol || "").toUpperCase(),
    name: data.name || data.symbol,
    image: data.image || getTokenImage(data.symbol),
    current_price: Number(data.price || data.current_price || data.priceUsd || data.lastPrice || 0),
    price_change_percentage_24h: Number(data.change24h || data.price_change_percentage_24h || data.changePercent24Hr || data.priceChangePercent || 0),
    total_volume: Number(data.volume || data.total_volume || data.volumeUsd24Hr || data.quoteVolume || 0),
    market_cap: Number(data.marketCap || data.market_cap || data.marketCapUsd || 0),
    market_cap_rank: Number(data.rank || data.market_cap_rank || 0),
    sparkline_in_7d: data.sparkline_in_7d || { price: [] },
    source
  };
}

// Provider 1: DIA Data
async function getDIA(): Promise<TokenData[]> {
  try {
    const res = await fetch(`${DIADATA_API}/assets?limit=200`);
    if (!res.ok) throw new Error('DIA failed');
    
    const data = await res.json();
    return data.map((t: any) => normalizeToken({
      id: t.symbol?.toLowerCase(),
      symbol: t.Symbol,
      name: t.Name,
      price: t.Price,
      volume: t.Volume24hUSD,
      change24h: t.PriceChange24h,
      marketCap: t.Marketcap,
      rank: t.Rank
    }, 'dia')).filter((t: any) => t.current_price > 0);
  } catch (e) {
    console.log("DIA failed:", e);
    return [];
  }
}

// Provider 2: CoinGecko
async function getCoinGecko(): Promise<TokenData[]> {
  try {
    const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h,7d&x_cg_demo_api_key=${COINGECKO_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`Gecko: ${response.status}`);
    
    const data = await response.json();
    return data.map((t: any) => normalizeToken(t, 'coingecko'));
  } catch (e) {
    console.log("CoinGecko failed:", e);
    return [];
  }
}

// Provider 3: CoinCap
async function getCoinCap(): Promise<TokenData[]> {
  try {
    const res = await fetch(`${COINCAP_API}/assets?limit=250`);
    if (!res.ok) throw new Error('CoinCap failed');
    
    const json = await res.json();
    return json.data.map((t: any) => normalizeToken({
      id: t.id,
      symbol: t.symbol,
      name: t.name,
      price: t.priceUsd,
      volume: t.volumeUsd24Hr,
      change24h: t.changePercent24Hr,
      marketCap: t.marketCapUsd,
      rank: t.rank
    }, 'coincap'));
  } catch (e) {
    console.log("CoinCap failed:", e);
    return [];
  }
}

// Provider 4: Binance (last fallback - prices only)
async function getBinance(): Promise<TokenData[]> {
  try {
    const res = await fetch(`${BINANCE_API}/ticker/24hr`);
    if (!res.ok) throw new Error('Binance failed');
    
    const data = await res.json();
    return data
      .filter((t: any) => t.symbol?.endsWith('USDT'))
      .slice(0, 200)
      .map((t: any) => normalizeToken({
        id: t.symbol.replace('USDT', '').toLowerCase(),
        symbol: t.symbol.replace('USDT', ''),
        name: t.symbol.replace('USDT', ''),
        price: t.lastPrice,
        change24h: t.priceChangePercent,
        volume: t.quoteVolume,
        marketCap: t.quoteVolume * 10 // rough estimate
      }, 'binance'));
  } catch (e) {
    console.log("Binance failed:", e);
    return [];
  }
}

// Export for external use (like usePrices hook)
export async function getAllBinancePrices(): Promise<any[]> {
  try {
    const response = await fetch(`${BINANCE_API}/ticker/24hr`);
    return await response.json();
  } catch {
    return [];
  }
}

// Main function with fallback chain
export async function getMarketDataWithFallback(): Promise<TokenData[]> {
  // Check memory cache first
  if (memoryCache && Date.now() - memoryCache.timestamp < MEMORY_CACHE_TTL) {
    return memoryCache.data;
  }

  const providers = [getCoinGecko, getCoinCap, getDIA, getBinance];
  
  for (const provider of providers) {
    try {
      const data = await provider();
      if (data && data.length > 50) {
        // Cache in memory
        memoryCache = { data, timestamp: Date.now() };
        // Also save to localStorage for persistence
        setCache(CACHE_KEYS.MARKET_V2, data);
        return data;
      }
    } catch (e) {
      console.log(`Provider ${provider.name} failed, trying next...`);
    }
  }

  // Return cached data as last resort
  const cached = getCache<TokenData[]>(CACHE_KEYS.MARKET_V2, 24 * 60 * 60 * 1000);
  if (cached) return cached;
  
  return [];
}