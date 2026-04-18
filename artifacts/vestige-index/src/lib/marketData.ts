// Vestige Index - Multi-source market data with fallback system
// Sources: CoinGecko (primary), CoinPaprika (fallback), Cache (last resort)

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const COINPAPRIKA_API = "https://api.coinpaprika.com/v1";

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

// Main function: Get market data with fallback
export async function getMarketData(): Promise<TokenData[]> {
  // Try CoinGecko first
  let data = await fetchFromCoinGecko();
  
  // If CoinGecko fails, try CoinPaprika
  if (data.length === 0) {
    console.log("Falling back to CoinPaprika...");
    data = await fetchFromCoinPaprika();
  }
  
  // If both fail, use cache
  if (data.length === 0) {
    console.log("Using cached data...");
    data = getFromCache();
  }
  
  // If still nothing, return empty array (will show loading)
  return data;
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