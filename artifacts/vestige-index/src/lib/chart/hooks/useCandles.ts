// Hook for fetching and caching candle data

import { useEffect, useCallback } from 'react';
import { useChartStore, type Candle } from '../store/chartStore';
import { 
  getCachedHistoricalDataWithFetch, 
  getCachedHistoricalData,
  setCachedHistoricalData 
} from '../../marketData';

const CACHE_PREFIX = 'vestige_candle_';

export function useCandles(symbol: string = 'BTCUSDT') {
  const setCandles = useChartStore((state) => state.setCandles);
  const setPriceRange = useChartStore((state) => state.setPriceRange);
  const setIsLoading = useChartStore((state) => state.setIsLoading);
  const candles = useChartStore((state) => state.candles);

  const loadCandles = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Try to get cached data first
      let data = getCachedHistoricalData(symbol);
      
      if (!data || data.length === 0) {
        console.log(`Fetching fresh data for ${symbol} from Binance...`);
        data = await getCachedHistoricalDataWithFetch(symbol, '1h', 168);
      }
      
      if (data && data.length > 0) {
        setCandles(data as Candle[]);
        
        // Calculate price range with padding
        const prices = data.flatMap(c => [c.high, c.low]);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const padding = (max - min) * 0.1;
        setPriceRange(min - padding, max + padding);
      }
    } catch (error) {
      console.error('Failed to load candles:', error);
      
      // Try to use any cached data even if expired
      try {
        const key = `${CACHE_PREFIX}${symbol.toUpperCase()}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry = JSON.parse(cached);
          if (entry.data && entry.data.length > 0) {
            console.log('Using expired cache as fallback');
            setCandles(entry.data);
            
            const prices = entry.data.flatMap((c: Candle) => [c.high, c.low]);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const padding = (max - min) * 0.1;
            setPriceRange(min - padding, max + padding);
          }
        }
      } catch (e) {
        console.error('Fallback cache error:', e);
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol, setCandles, setPriceRange, setIsLoading]);

  useEffect(() => {
    loadCandles();
  }, [loadCandles]);

  const refreshCandles = useCallback(async () => {
    // Force refresh by clearing cache for this symbol
    try {
      const key = `vestige_historical_${symbol.toUpperCase()}`;
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Cache clear error:', e);
    }
    await loadCandles();
  }, [symbol, loadCandles]);

  return { candles, refreshCandles };
}
