const CMC_API_KEY = import.meta.env.VITE_COINMARKETCAP_API_KEY || "";
const CMC_BASE = "https://pro-api.coinmarketcap.com/v1";

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

// Enrich CMC data with Binance prices for faster updates
export async function getEnrichedMarketData(): Promise<EnrichedToken[]> {
  const cmcTokens = await getTop1000FromCMC();
  
  if (cmcTokens.length === 0) {
    return [];
  }

  // Get Binance prices for top symbols for faster updates
  const topSymbols = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "MATIC", "DOT", "AVAX"];
  const binancePrices = await getBinancePrices(topSymbols);

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