const CMC_API_KEY = import.meta.env.VITE_COINMARKETCAP_API_KEY || "";
const CMC_BASE = "https://pro-api.coinmarketcap.com/v1";

// Fallback API bases (no key needed)
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const COINGECKO_API_FREE = "https://api.coingecko.com/api/v3";
const BYNANCE_API = "https://api.binance.com/api/v3";
const BYNANCE_API_FREE = "https://api.binance.com/api/v3";
const KUCoin_API = "https://api.kucoin.com/api/v1";
const OKX_API = "https://www.okx.com/api/v5/market";

export interface CMCToken {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  market_pair_count?: number;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      volume_change_24h?: number;
      percent_change_1h?: number;
      percent_change_24h: number;
      percent_change_7d?: number;
      percent_change_30d?: number;
      market_cap: number;
      market_cap_dominance: number;
      fully_diluted_market_cap?: number;
      circlating_supply?: number;
      total_supply?: number;
      max_supply?: number;
    };
  };
}

export interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  count: number;
}

export interface EnrichedToken {
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

// CoinMarketCap API - Get top 1000 cryptocurrencies
export async function getTop1000FromCMC(): Promise<CMCToken[]> {
  try {
    const url = `${CMC_BASE}/cryptocurrency/listings/latest?start=1&limit=1000&convert=USD`;
    const response = await fetch(url, {
      headers: {
        "X-CMC_PRO_API_KEY": CMC_API_KEY,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error("CMC API error:", response.status);
      throw new Error(`CMC API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch from CoinMarketCap:", error);
    return [];
  }
}

// Binance API - Get 24hr ticker data for specific symbols
export async function getBinancePrices(symbols: string[]): Promise<Map<string, BinanceTicker>> {
  try {
    const result = new Map<string, BinanceTicker>();
    
    // Fetch all tickers and filter
    const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
    if (!response.ok) {
      throw new Error("Binance API error");
    }

    const allTickers: BinanceTicker[] = await response.json();
    
    // Filter only the symbols we need
    for (const symbol of symbols) {
      const binanceSymbol = `${symbol.toUpperCase()}USDT`;
      const ticker = allTickers.find((t) => t.symbol === binanceSymbol);
      if (ticker) {
        result.set(symbol.toUpperCase(), ticker);
      }
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch from Binance:", error);
    return new Map();
  }
}

// Get all Binance top coins prices
export async function getAllBinancePrices(): Promise<BinanceTicker[]> {
  try {
    const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
    if (!response.ok) {
      throw new Error("Binance API error");
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from Binance:", error);
    return [];
  }
}

// Get specific Binance ticker
export async function getBinanceTicker(symbol: string): Promise<BinanceTicker | null> {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol.toUpperCase()}USDT`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// CoinGecko fallback - NO API KEY NEEDED (limited but works)
async function getTop1000FromCoinGecko(): Promise<CMCToken[]> {
  try {
    // Get top 250 from page 1
    const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h,24h,7d,30d`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error("CoinGecko API error:", response.status);
      return [];
    }
    const data = await response.json();
    
    // Convert CoinGecko format to CMC format
    return data.map((coin: any) => ({
      id: coin.market_cap_rank || 0,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      slug: coin.id,
      cmc_rank: coin.market_cap_rank || 0,
      quote: {
        USD: {
          price: coin.current_price || 0,
          volume_24h: coin.total_volume || 0,
          volume_change_24h: 0,
          percent_change_1h: coin.price_change_percentage_1h_in_currency || 0,
          percent_change_24h: coin.price_change_percentage_24h || 0,
          percent_change_7d: coin.price_change_percentage_7d_in_currency || 0,
          percent_change_30d: coin.price_change_percentage_30d_in_currency || 0,
          market_cap: coin.market_cap || 0,
          market_cap_dominance: 0,
          fully_diluted_market_cap: coin.fully_diluted_valuation || 0,
          circulating_supply: coin.circulating_supply || 0,
          total_supply: coin.total_supply || 0,
          max_supply: coin.max_supply || 0,
        }
      }
    }));
  } catch (error) {
    console.error("Failed to fetch from CoinGecko:", error);
    return [];
  }
}

// Fallback Binance prices from multiple sources
async function getBinancePricesFallback(symbols: string[]): Promise<Map<string, BinanceTicker>> {
  const result = new Map<string, BinanceTicker>();
  
  // Try Binance first
  try {
    const response = await fetch(`${BYNANCE_API}/ticker/24hr`);
    if (response.ok) {
      const allTickers: BinanceTicker[] = await response.json();
      for (const symbol of symbols) {
        const binanceSymbol = `${symbol.toUpperCase()}USDT`;
        const ticker = allTickers.find((t) => t.symbol === binanceSymbol);
        if (ticker) result.set(symbol.toUpperCase(), ticker);
      }
      if (result.size > 0) {
        console.log("Using Binance prices");
        return result;
      }
    }
  } catch (e) { console.error("Binance failed:", e); }
  
  // Fallback to KuCoin
  try {
    for (const symbol of symbols) {
      const resp = await fetch(`${KUCoin_API}/market/candles?symbol=${symbol}-USDT&type=1min&size=1`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.data && data.data.length > 0) {
          const candle = data.data[0];
          result.set(symbol.toUpperCase(), {
            symbol: `${symbol.toUpperCase()}USDT`,
            priceChange: "0",
            priceChangePercent: "0",
            weightedAvgPrice: candle[2],
            prevClosePrice: candle[1],
            lastPrice: candle[2],
            lastQty: "0",
            bidPrice: "0",
            bidQty: "0",
            askPrice: "0",
            askQty: "0",
            openPrice: candle[1],
            highPrice: candle[3],
            lowPrice: candle[4],
            volume: candle[5],
            quoteVolume: "0",
            count: 0,
          });
        }
      }
    }
    if (result.size > 0) console.log("Using KuCoin fallback prices");
  } catch (e) { console.error("KuCoin failed:", e); }
  
  // Fallback to CoinGecko prices
  if (result.size === 0) {
    try {
      const ids = symbols.map(s => {
        const map: Record<string, string> = {
          BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana",
          XRP: "ripple", ADA: "cardano", DOGE: "dogecoin", MATIC: "matic-network",
          DOT: "polkadot", AVAX: "avalanche-2", TRX: "tron", LTC: "litecoin",
        };
        return map[s.toUpperCase()] || s.toLowerCase();
      }).join(",");
      
      const resp = await fetch(`${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
      if (resp.ok) {
        const data = await resp.json();
        for (const symbol of symbols) {
          const map: Record<string, string> = {
            BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana",
            XRP: "ripple", ADA: "cardano", DOGE: "dogecoin", MATIC: "matic-network",
            DOT: "polkadot", AVAX: "avalanche-2", TRX: "tron", LTC: "litecoin",
          };
          const id = map[symbol.toUpperCase()];
          if (id && data[id]) {
            result.set(symbol.toUpperCase(), {
              symbol: `${symbol.toUpperCase()}USDT`,
              priceChange: "0",
              priceChangePercent: String(data[id].usd_24h_change || 0),
              weightedAvgPrice: String(data[id].usd || 0),
              prevClosePrice: String(data[id].usd || 0),
              lastPrice: String(data[id].usd || 0),
              lastQty: "0",
              bidPrice: "0",
              bidQty: "0",
              askPrice: "0",
              askQty: "0",
              openPrice: String(data[id].usd || 0),
              highPrice: String(data[id].usd || 0),
              lowPrice: String(data[id].usd || 0),
              volume: "0",
              quoteVolume: "0",
              count: 0,
            });
          }
        }
        console.log("Using CoinGecko fallback prices");
      }
    } catch (e) { console.error("CoinGecko price fallback failed:", e); }
  }
  
  return result;
}

// Enrich CMC data with Binance prices for faster updates
export async function getEnrichedMarketData(): Promise<EnrichedToken[]> {
  console.log("Fetching market data...");
  
  let cmcTokens = await getTop1000FromCMC();

  // Fallback to CoinGecko if CMC fails
  if (cmcTokens.length === 0) {
    console.log("CMC failed, falling back to CoinGecko...");
    cmcTokens = await getTop1000FromCoinGecko();
  }

  if (cmcTokens.length === 0) {
    console.log("All APIs failed, returning empty");
    return [];
  }

  console.log(`Got ${cmcTokens.length} tokens from API`);

  // Get Binance prices for top symbols for faster updates
  const topSymbols = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "MATIC", "DOT", "AVAX"];
  const binancePrices = await getBinancePricesFallback(topSymbols);

  // Map CMC data to our format
  const enriched: EnrichedToken[] = cmcTokens.map((token) => {
    const quote = token.quote.USD;
    const symbol = token.symbol.toUpperCase();
    
    // Use Binance price if available for faster updates
    let price = quote.price;
    let change24h = quote.percent_change_24h || 0;
    
    const binanceTicker = binancePrices.get(symbol);
    if (binanceTicker) {
      price = parseFloat(binanceTicker.lastPrice);
      change24h = parseFloat(binanceTicker.priceChangePercent);
    }

    return {
      id: token.id.toString(),
      symbol: token.symbol,
      name: token.name,
      image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`,
      current_price: price,
      price_change_percentage_24h: change24h,
      price_change_percentage_7d_in_currency: quote.percent_change_7d || 0,
      total_volume: quote.volume_24h || 0,
      market_cap: quote.market_cap || 0,
      market_cap_rank: token.cmc_rank,
      sparkline_in_7d: undefined, // CMC doesn't provide sparkline
    };
  });

  return enriched;
}

// Fetch single token price from CMC
export async function getTokenPriceFromCMC(symbol: string): Promise<number | null> {
  try {
    const url = `${CMC_BASE}/cryptocurrency/quotes/latest?symbol=${symbol.toUpperCase()}&convert=USD`;
    const response = await fetch(url, {
      headers: {
        "X-CMC_PRO_API_KEY": CMC_API_KEY,
        "Accept": "application/json",
      },
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    const token = data.data?.[symbol.toUpperCase()];
    
    if (token?.quote?.USD?.price) {
      return token.quote.USD.price;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Get multiple token prices
export async function getMultipleTokenPrices(symbols: string[]): Promise<Record<string, number>> {
  try {
    const symbolsStr = symbols.join(",");
    const url = `${CMC_BASE}/cryptocurrency/quotes/latest?symbol=${symbolsStr}&convert=USD`;
    const response = await fetch(url, {
      headers: {
        "X-CMC_PRO_API_KEY": CMC_API_KEY,
        "Accept": "application/json",
      },
    });

    if (!response.ok) return {};
    
    const data = await response.json();
    const result: Record<string, number> = {};
    
    for (const [sym, tokenData] of Object.entries(data.data || {})) {
      const token = tokenData as CMCToken;
      if (token.quote?.USD?.price) {
        result[token.symbol] = token.quote.USD.price;
      }
    }
    
    return result;
  } catch {
    return {};
  }
}