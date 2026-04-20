// Vestige Index - Multi-source market data with fallback system
// Priority: DIA → CoinGecko → CoinCap → Binance (last fallback)

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const DIADATA_API = "https://api.diadata.org/v1";
const COINCAP_API = "https://api.coincap.io/v2";
const BINANCE_API = "https://api.binance.com/api/v3";

// API Keys
const COINGECKO_API_KEY = "CG-ekuLMwNLc7RbL3Km4x4NxKec";

// Interfaces
interface RawTokenData {
  id?: string;
  symbol?: string;
  name?: string;
  image?: string;
  // DIA API uses capitalized property names
  Symbol?: string;
  Name?: string;
  Price?: number | string;
  Volume24hUSD?: number | string;
  PriceChange24h?: number | string;
  Marketcap?: number | string;
  Rank?: number | string;
  // Standard API property names
  price?: number | string;
  current_price?: number | string;
  priceUsd?: number | string;
  lastPrice?: number | string;
  change24h?: number | string;
  price_change_percentage_24h?: number | string;
  changePercent24Hr?: number | string;
  priceChangePercent?: number | string;
  volume?: number | string;
  total_volume?: number | string;
  volumeUsd24Hr?: number | string;
  quoteVolume?: number | string;
  marketCap?: number | string;
  market_cap?: number | string;
  marketCapUsd?: number | string;
  rank?: number | string;
  market_cap_rank?: number | string;
  sparkline_in_7d?: { price: number[] };
}

export interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

// In-memory cache
let cache: TokenData[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 seconds

// LocalStorage key
const CACHE_KEY = "vestige_market_cache";

// Helper: fetch with timeout (5s)
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (e: any) {
    clearTimeout(timeout);
    throw e;
  }
}

// Helper: validate data
function isValid(data: TokenData[]): boolean {
  return Array.isArray(data) && data.length > 5;
}

// Helper: get localStorage cache
function getLocalCache<T>(maxAge: number): T | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < maxAge) {
        return data;
      }
    }
  } catch {}
  return null;
}

// Helper: set localStorage cache
function setLocalCache(data: TokenData[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

// Token icons
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
  FIL: "https://assets.coingecko.com/coins/images/12817/small/filecoin.png",
  TRX: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
  XMR: "https://assets.coingecko.com/coins/images/69/small/monero_logo.png",
  ETC: "https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png",
  XTZ: "https://assets.coingecko.com/coins/images/976/small/Tezos-logo.png",
  SHIB: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
  PEPE: "https://assets.coingecko.com/coins/images/31053/small/pepe-token.jpeg",
  ARB: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.12.jpeg",
  OP: "https://assets.coingecko.com/coins/images/25246/small/Optimism.png",
  SUI: "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg",
  AAVE: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
};

function getTokenImage(symbol: string): string {
  const upper = symbol?.toUpperCase() || "";
  return TOKEN_ICONS[upper] || `https://assets.coingecko.com/coins/images/1/small/${symbol?.toLowerCase() || ""}.png`;
}

// Normalize token data
function normalizeToken(data: RawTokenData, source: string): TokenData {
  const symbol = data.symbol || "";
  return {
    id: data.id || symbol.toLowerCase() || "unknown",
    symbol: symbol.toUpperCase(),
    name: data.name || symbol || "Unknown",
    image: data.image || getTokenImage(symbol),
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
    const res = await fetchWithTimeout(`${DIADATA_API}/assets?limit=200`);
    if (!res.ok) throw new Error('DIA failed');
    
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    
    return data
      .map((t: RawTokenData) => normalizeToken({
        id: t.Symbol?.toLowerCase(),
        symbol: t.Symbol,
        name: t.Name,
        price: t.Price,
        volume: t.Volume24hUSD,
        change24h: t.PriceChange24h,
        marketCap: t.Marketcap,
        rank: t.Rank
      }, 'dia'))
      .filter((t: TokenData) => t.current_price > 0 && t.symbol);
  } catch (e: any) {
    console.log('DIA failed:', e.message);
    return [];
  }
}

// Provider 2: CoinGecko
async function getGecko(): Promise<TokenData[]> {
  try {
    const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h,7d&x_cg_demo_api_key=${COINGECKO_API_KEY}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`Gecko: ${res.status}`);
    
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    
    return data.map((t: RawTokenData) => normalizeToken(t, 'coingecko'));
  } catch (e: any) {
    console.log('CoinGecko failed:', e.message);
    return [];
  }
}

// Provider 3: CoinCap
async function getCoinCap(): Promise<TokenData[]> {
  try {
    const res = await fetchWithTimeout(`${COINCAP_API}/assets?limit=250`);
    if (!res.ok) throw new Error('CoinCap failed');
    
    const json = await res.json();
    if (!json.data) return [];
    
    return json.data.map((t: RawTokenData) => normalizeToken({
      id: t.id,
      symbol: t.symbol,
      name: t.name,
      price: t.priceUsd,
      volume: t.volumeUsd24Hr,
      change24h: t.changePercent24Hr,
      marketCap: t.marketCapUsd,
      rank: t.rank
    }, 'coincap'));
  } catch (e: any) {
    console.log('CoinCap failed:', e.message);
    return [];
  }
}

// Provider 4: Binance (last fallback)
async function getBinance(): Promise<TokenData[]> {
  try {
    const res = await fetchWithTimeout(`${BINANCE_API}/ticker/24hr`);
    if (!res.ok) throw new Error('Binance failed');
    
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    
    return data
      .filter((t: RawTokenData) => t.symbol?.endsWith('USDT'))
      .slice(0, 200)
      .map((t: RawTokenData) => {
        const symbol = t.symbol || '';
        return normalizeToken({
          id: symbol.replace('USDT', '').toLowerCase(),
          symbol: symbol.replace('USDT', ''),
          name: symbol.replace('USDT', ''),
          price: t.lastPrice,
          change24h: t.priceChangePercent,
          volume: t.quoteVolume,
          marketCap: Number(t.quoteVolume) * 10
        }, 'binance');
      });
  } catch (e: any) {
    console.log('Binance failed:', e.message);
    return [];
  }
}

// Main: Cached market data
export async function getMarketData(): Promise<TokenData[]> {
  // Check memory cache first
  if (cache && Date.now() - lastFetch < CACHE_TTL) {
    console.log('Using memory cache');
    return cache;
  }

  const providers = [getDIA, getGecko, getCoinCap];

  for (const provider of providers) {
    try {
      console.log('Trying:', provider.name);
      const data = await provider();

      if (isValid(data)) {
        console.log('Using provider:', provider.name, 'with', data.length, 'tokens');
        cache = data;
        lastFetch = Date.now();
        setLocalCache(data);
        return data;
      }
    } catch (e: any) {
      console.log('Failed:', provider.name, '-', e.message);
    }
  }

  // Final fallback: Binance
  console.log('All providers failed, trying Binance...');
  const binance = await getBinance();
  
  if (isValid(binance)) {
    cache = binance;
    lastFetch = Date.now();
    return binance;
  }

  // Last resort: localStorage cache
  console.log('All failed, trying localStorage cache...');
  const localCache = getLocalCache<TokenData[]>(24 * 60 * 60 * 1000);
  if (localCache && isValid(localCache)) {
    cache = localCache;
    lastFetch = Date.now();
    return localCache;
  }

  // Return whatever we have or empty
  console.log('NO MARKET DATA AVAILABLE');
  return cache || [];
}

// Export for external use
export async function getAllBinancePrices(): Promise<BinanceTicker[]> {
  try {
    const res = await fetchWithTimeout(`${BINANCE_API}/ticker/24hr`);
    return await res.json();
  } catch {
    return [];
  }
}

// Legacy exports
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
  source?: string;
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
  return data.map((t: TokenData) => ({
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