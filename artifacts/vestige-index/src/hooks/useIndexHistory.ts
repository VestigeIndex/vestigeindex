import { useState, useEffect, useCallback } from "react";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

export interface HistoricalData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface IndexHistory {
  symbol: string;
  data: HistoricalData | null;
  loading: boolean;
  error: string | null;
}

export function useIndexHistory(coinGeckoId: string | undefined, days = 30) {
  const [data, setData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!coinGeckoId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${COINGECKO_BASE}/coins/${coinGeckoId}/market_chart?vs_currency=usd&days=${days}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        if (resp.status === 429) {
          setError("Rate limit exceeded");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const result = await resp.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [coinGeckoId, days]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
}

export function useAllIndicesHistory(coinGeckoIds: Record<string, string>, days = 30) {
  const [histories, setHistories] = useState<Record<string, HistoricalData | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results: Record<string, HistoricalData | null> = {};

      for (const [symbol, id] of Object.entries(coinGeckoIds)) {
        try {
          const url = `${COINGECKO_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
          const resp = await fetch(url);
          if (resp.ok) {
            results[symbol] = await resp.json();
          } else {
            results[symbol] = null;
          }
        } catch {
          results[symbol] = null;
        }
      }

      setHistories(results);
      setLoading(false);
    };

    fetchAll();
  }, [Object.values(coinGeckoIds).join(","), days]);

  return { histories, loading };
}
