import { useState, useEffect, useCallback } from "react";
import { getEnrichedMarketData, getAllBinancePrices, type EnrichedToken, type BinanceTicker } from "../lib/marketData";

export { type EnrichedToken as CoinData } from "../lib/marketData";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export function usePrices(page = 1, perPage = 1000) {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoins = useCallback(async () => {
    try {
      // Use CoinMarketCap + Binance for top 1000
      const data = await getEnrichedMarketData();
      setCoins(data);
      setError(null);
    } catch {
      setError("Could not load market data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoins();
    const id = setInterval(fetchCoins, 60000);
    return () => clearInterval(id);
  }, [fetchCoins]);

  return { coins, loading, error, refetch: fetchCoins };
}

const TICKER_SYMBOLS = ["BTC", "ETH", "BNB", "SOL", "LINK", "1INCH"];

export interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  isUp: boolean;
}

export function useTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  const fetchTicker = useCallback(async () => {
    try {
      // Use Binance API for real-time prices
      const allTickers = await getAllBinancePrices();
      
      const targetSymbols = ["BTC", "ETH", "BNB", "SOL", "LINK", "1INCH", "XRP", "ADA", "DOGE", "MATIC", "DOT", "AVAX", "TRX", "LTC"];
      const binanceSymbolMap: Record<string, { symbol: string; name: string }> = {
        BTCUSDT: { symbol: "BTC", name: "Bitcoin" },
        ETHUSDT: { symbol: "ETH", name: "Ethereum" },
        BNBUSDT: { symbol: "BNB", name: "BNB" },
        SOLUSDT: { symbol: "SOL", name: "Solana" },
        LINKUSDT: { symbol: "LINK", name: "Chainlink" },
        "1INCHUSDT": { symbol: "1INCH", name: "1inch" },
        XRPUSDT: { symbol: "XRP", name: "XRP" },
        ADAUSDT: { symbol: "ADA", name: "Cardano" },
        DOGEUSDT: { symbol: "DOGE", name: "Dogecoin" },
        MATICUSDT: { symbol: "MATIC", name: "Polygon" },
        DOTUSDT: { symbol: "DOT", name: "Polkadot" },
        AVAXUSDT: { symbol: "AVAX", name: "Avalanche" },
        TRXUSDT: { symbol: "TRX", name: "TRON" },
        LTCUSDT: { symbol: "LTC", name: "Litecoin" },
      };

      const result: TickerItem[] = allTickers
        .filter(t => binanceSymbolMap[t.symbol])
        .map(t => ({
          symbol: binanceSymbolMap[t.symbol].symbol,
          name: binanceSymbolMap[t.symbol].name,
          price: parseFloat(t.lastPrice),
          change: parseFloat(t.priceChangePercent),
          isUp: parseFloat(t.priceChangePercent) >= 0,
        }));

      // Add traditional markets
      const extraItems: TickerItem[] = [
        { symbol: "S&P 500", name: "S&P 500", price: 5200, change: 0.12, isUp: true },
        { symbol: "NASDAQ", name: "Nasdaq", price: 18100, change: -0.08, isUp: false },
        { symbol: "DAX", name: "DAX", price: 17800, change: 0.21, isUp: true },
      ];

      setItems([...result, ...extraItems]);
    } catch {
      // Fallback to CoinGecko if Binance fails
      try {
        const geckoIds = "bitcoin,ethereum,binancecoin,solana,chainlink,1inch";
        const url = `${COINGECKO_BASE}/simple/price?ids=${geckoIds}&vs_currencies=usd&include_24hr_change=true`;
        const resp = await fetch(url);
        if (!resp.ok) return;
        const data = await resp.json();

        const mapping: Record<string, { symbol: string; name: string }> = {
          bitcoin: { symbol: "BTC", name: "Bitcoin" },
          ethereum: { symbol: "ETH", name: "Ethereum" },
          binancecoin: { symbol: "BNB", name: "BNB" },
          solana: { symbol: "SOL", name: "Solana" },
          chainlink: { symbol: "LINK", name: "Chainlink" },
          "1inch": { symbol: "1INCH", name: "1inch" },
        };

        const result: TickerItem[] = Object.entries(mapping).map(([id, meta]) => {
          const d = data[id] || {};
          const change = d.usd_24h_change ?? 0;
          return {
            symbol: meta.symbol,
            name: meta.name,
            price: d.usd ?? 0,
            change,
            isUp: change >= 0,
          };
        });

        const extraItems: TickerItem[] = [
          { symbol: "S&P 500", name: "S&P 500", price: 5200, change: 0.12, isUp: true },
          { symbol: "NASDAQ", name: "Nasdaq", price: 18100, change: -0.08, isUp: false },
          { symbol: "DAX", name: "DAX", price: 17800, change: 0.21, isUp: true },
        ];

        setItems([...result, ...extraItems]);
      } catch {
        // Keep previous data on error
      }
    }
  }, []);

  useEffect(() => {
    fetchTicker();
    const id = setInterval(fetchTicker, 30000);
    return () => clearInterval(id);
  }, [fetchTicker]);

  return items;
}

export function useIndexPrices() {
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({});

  const fetchIndexPrices = useCallback(async () => {
    try {
      // All indices from config - use CoinGecko IDs
      const ids = [
        "defipulse-index",         // DPI
        "metaverse-index",        // MVI
        "index-coop-large-cap-index", // IC21
        "pax-gold",              // PAXG
        "tether-gold",           // XAUt
        "backed-cspx",           // bCSPX
        "backed-ibta",           // bIBTA
        "data-economy-index",     // DATA
        "synthetix-defi-index",  // sDEFI
        "synthetix-cex-index",   // sCEX
      ].join(",");
      
      const url = `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
      const resp = await fetch(url);
      if (!resp.ok) return;
      const data = await resp.json();

      // Map CoinGecko IDs to symbols
      const mapping: Record<string, string> = {
        "defipulse-index": "DPI",
        "metaverse-index": "MVI",
        "index-coop-large-cap-index": "IC21",
        "pax-gold": "PAXG",
        "tether-gold": "XAUt",
        "backed-cspx": "bCSPX",
        "backed-ibta": "bIBTA",
        "data-economy-index": "DATA",
        "synthetix-defi-index": "sDEFI",
        "synthetix-cex-index": "sCEX",
      };

      const result: Record<string, { price: number; change: number }> = {};
      for (const [id, symbol] of Object.entries(mapping)) {
        const d = data[id] || {};
        result[symbol] = { price: d.usd ?? 0, change: d.usd_24h_change ?? 0 };
      }
      setPrices(result);
    } catch {
      console.error("Failed to fetch index prices:", err);
    }
  }, []);

  useEffect(() => {
    fetchIndexPrices();
    const id = setInterval(fetchIndexPrices, 60000);
    return () => clearInterval(id);
  }, [fetchIndexPrices]);

  return prices;
}
