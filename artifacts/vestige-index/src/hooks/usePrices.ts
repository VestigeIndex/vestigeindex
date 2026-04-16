import { useState, useEffect, useCallback } from "react";

export interface CoinData {
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

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export function usePrices(page = 1, perPage = 100) {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoins = useCallback(async () => {
    try {
      const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h,7d`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("CoinGecko error");
      const data = await resp.json();
      setCoins(data);
      setError(null);
    } catch {
      setError("Could not load market data");
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

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
      const ids = "defipulse-index,metaverse-index,data-economy-index,pax-gold,tether-gold,chainlink,1inch";
      const url = `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
      const resp = await fetch(url);
      if (!resp.ok) return;
      const data = await resp.json();

      const mapping: Record<string, string> = {
        DPI: "defipulse-index",
        MVI: "metaverse-index",
        DATA: "data-economy-index",
        PAXG: "pax-gold",
        XAUt: "tether-gold",
        LINK: "chainlink",
        "1INCH": "1inch",
      };

      const result: Record<string, { price: number; change: number }> = {};
      for (const [sym, id] of Object.entries(mapping)) {
        const d = data[id] || {};
        result[sym] = { price: d.usd ?? 0, change: d.usd_24h_change ?? 0 };
      }
      result["OIL"] = { price: 82.45, change: -0.34 };
      setPrices(result);
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchIndexPrices();
    const id = setInterval(fetchIndexPrices, 60000);
    return () => clearInterval(id);
  }, [fetchIndexPrices]);

  return prices;
}
