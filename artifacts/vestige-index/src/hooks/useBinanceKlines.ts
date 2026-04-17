import { useState, useEffect, useCallback } from "react";
import { getBinanceKlines, type KlineData } from "../lib/binanceApi";

export { type KlineData } from "../lib/binanceApi";

export function useBinanceKlines(
  symbol: string = "BTC",
  interval: KlineInterval = "1d",
  limit: number = 365
) {
  const [data, setData] = useState<KlineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKlines = useCallback(async () => {
    try {
      setLoading(true);
      const klines = await getBinanceKlines(symbol, interval, limit);
      setData(klines);
      setError(null);
    } catch (err) {
      setError("Failed to load chart data");
      console.error("Klines error:", err);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, limit]);

  useEffect(() => {
    fetchKlines();
    // Optional: Auto-refresh every 5 minutes for live charts
    const id = setInterval(fetchKlines, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchKlines]);

  return { data, loading, error, refetch: fetchKlines };
}

export type KlineInterval = 
  | "1m" 
  | "3m" 
  | "5m" 
  | "15m" 
  | "30m" 
  | "1h" 
  | "2h" 
  | "4h" 
  | "6h" 
  | "8h" 
  | "12h" 
  | "1d" 
  | "3d" 
  | "1w" 
  | "1M";

// Price intervals mapping for UI
export const INTERVAL_LABELS: Record<KlineInterval, string> = {
  "1m": "1 min",
  "3m": "3 min",
  "5m": "5 min",
  "15m": "15 min",
  "30m": "30 min",
  "1h": "1 hour",
  "2h": "2 hours",
  "4h": "4 hours",
  "6h": "6 hours",
  "8h": "8 hours",
  "12h": "12 hours",
  "1d": "1 day",
  "3d": "3 days",
  "1w": "1 week",
  "1M": "1 month",
};