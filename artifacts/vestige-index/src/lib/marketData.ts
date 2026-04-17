// Vestige Index - Multi-source market data with caching
// Sources: Binance (primary), CoinGecko (fallback)
// Cache: 30min for CoinGecko, 30s for Binance

const BINANCE_API = "https://api.binance.com/api/v3";
const COINGECKO_API = "https://api.coingecko.com/api/v3";

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
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
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
  XEM: "https://assets.coingecko.com/coins/images/873/small/xem-logo.png",
  XTZ: "https://assets.coingecko.com/coins/images/976/small/Tezos-logo.png",
  BTCB: "https://assets.coingecko.com/coins/images/14286/small/BTCB.png",
  CAKE: "https://assets.coingecko.com/coins/images/12632/small/cake.png",
  BTT: "https://assets.coingecko.com/coins/images/23030/small/btt.png",
  HOT: "https://assets.coingecko.com/coins/images/5378/small/hotcoin.jpg",
  AR: "https://assets.coingecko.com/coins/images/4343/small/oRtixSiK_400x400.jpg",
  SAND: "https://assets.coingecko.com/coins/images/6219/small/sandbox_logo.jpg",
  MANA: "https://assets.coingecko.com/coins/images/878/small/mana.png",
  ENJ: "https://assets.coingecko.com/coins/images/4712/small/enjincoin.png",
  AXS: "https://assets.coingecko.com/coins/images/13029/small/axie_infinity_logo.png",
  CHZ: "https://assets.coingecko.com/coins/images/8834/small/chz-token.png",
  AAVE: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
  MKR: "https://assets.coingecko.com/coins/images/13686/small/Mark_new_256.png",
  SNX: "https://assets.coingecko.com/coins/images/3406/small/SNX.png",
  CRV: "https://assets.coingecko.com/coins/images/12124/small/Curve.png",
  COMP: "https://assets.coingecko.com/coins/images/10775/small/COMP.png",
  YFI: "https://assets.coingecko.com/coins/images/11849/small/yearn-finance-yfi-logo.png",
  SUSHI: "https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_text_3.png",
  BAL: "https://assets.coingecko.com/coins/images/11683/small/Balancer_Vertical_White_RGB.png",
  GRT: "https://assets.coingecko.com/coins/images/9977/small/GRT.png",
  ENS: "https://assets.coingecko.com/coins/images/19785/small/acat.png",
  "1INCH": "https://assets.coingecko.com/coins/images/13469/small/1inch-token.png",
  RUNE: "https://assets.coingecko.com/coins/images/6595/small/Rune200x200.png",
  KAVA: "https://assets.coingecko.com/coins/images/9761/small/kava.png",
  ZEC: "https://assets.coingecko.com/coins/images/486/small/zelcore.png",
  WAVES: "https://assets.coingecko.com/coins/images/11311/small/waves.png",
  ZIL: "https://assets.coingecko.com/coins/images/996/small/zilliqa-logo.png",
  MIN: "https://assets.coingecko.com/coins/images/15067/small/photo_2022-01-17_14-36-33.jpg",
  EGLD: "https://assets.coingecko.com/coins/images/12337/small/egld-token-logo.png",
  OMG: "https://assets.coingecko.com/coins/images/776/small/OMG_Network.jpg",
  ZRX: "https://assets.coingecko.com/coins/images/390/small/zrx.png",
  SKL: "https://assets.coingecko.com/coins/images/14169/small/skill_2023.jpg",
  SXP: "https://assets.coingecko.com/coins/images/9368/small/swipe.png",
  LDO: "https://assets.coingecko.com/coins/images/13573/small/LDO_token_circle.png",
  RVN: "https://assets.coingecko.com/coins/images/2577/small/ravencoin.png",
  QNT: "https://assets.coingecko.com/coins/images/3370/small/5ZOu7brX.jpg",
  RPL: "https://assets.coingecko.com/coins/images/1583/small/revoke.png",
  LRC: "https://assets.coingecko.com/coins/images/1358/small/LRC.png",
  OP: "https://assets.coingecko.com/coins/images/25246/small/Optimism.png",
  ARB: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.12.jpeg",
  INJ: "https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png",
  SUI: "https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg",
  PEPE: "https://assets.coingecko.com/coins/images/31053/small/pepe-token.jpeg",
  SHIB: "https://assets.coingecko.com/coins/images/11939/small/shiba.png",
};

function getTokenImage(symbol: string): string {
  const upper = symbol.toUpperCase();
  if (TOKEN_ICONS[upper]) {
    return TOKEN_ICONS[upper];
  }
  // Fallback to generic CoinGecko icon
  return `https://assets.coingecko.com/coins/images/1/small/${symbol.toLowerCase()}.png`;
}

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
        image: getTokenImage(symbol),
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