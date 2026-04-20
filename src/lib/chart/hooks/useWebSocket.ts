// WebSocket hook for Binance real-time data

import { useEffect, useRef, useCallback } from 'react';
import { useChartStore, type Candle } from '../store/chartStore';

const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws';

interface BinanceKlineMessage {
  e: string;
  k: {
    t: number;
    o: string;
    h: string;
    l: string;
    c: string;
    v: string;
    x: boolean;
  };
}

interface BinanceDepthMessage {
  bids: [string, string][];
  asks: [string, string][];
}

export function useWebSocket(symbol: string = 'btcusdt') {
  const updateLastCandle = useChartStore((state) => state.updateLastCandle);
  const setOrderBook = useChartStore((state) => state.setOrderBook);
  const setIsLoading = useChartStore((state) => state.setIsLoading);
  
  const wsRef = useRef<WebSocket | null>(null);
  const depthWsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    // Clean up existing connections
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (depthWsRef.current) {
      depthWsRef.current.close();
    }

    const klineSymbol = symbol.toLowerCase();
    
    // Connect to kline stream
    const klineUrl = `${BINANCE_WS_BASE}/${klineSymbol}@kline_1m`;
    wsRef.current = new WebSocket(klineUrl);

    wsRef.current.onmessage = (event) => {
      try {
        const data: BinanceKlineMessage = JSON.parse(event.data);
        if (data.k) {
          const candle: Candle = {
            time: data.k.t,
            open: parseFloat(data.k.o),
            high: parseFloat(data.k.h),
            low: parseFloat(data.k.l),
            close: parseFloat(data.k.c),
            volume: parseFloat(data.k.v),
          };
          updateLastCandle(candle);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Failed to parse kline message:', e);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('Kline WebSocket closed, reconnecting...');
      setTimeout(connect, 5000);
    };

    // Connect to depth stream for order book
    const depthUrl = `${BINANCE_WS_BASE}/${klineSymbol}@depth20@100ms`;
    depthWsRef.current = new WebSocket(depthUrl);

    depthWsRef.current.onmessage = (event) => {
      try {
        const data: BinanceDepthMessage = JSON.parse(event.data);
        const bids = data.bids.map(([price, qty]) => ({
          price: parseFloat(price),
          quantity: parseFloat(qty),
        }));
        const asks = data.asks.map(([price, qty]) => ({
          price: parseFloat(price),
          quantity: parseFloat(qty),
        }));
        setOrderBook(bids, asks);
      } catch (e) {
        console.error('Failed to parse depth message:', e);
      }
    };

    depthWsRef.current.onerror = (error) => {
      console.error('Depth WebSocket error:', error);
    };

    depthWsRef.current.onclose = () => {
      console.log('Depth WebSocket closed, reconnecting...');
      setTimeout(connect, 5000);
    };
  }, [symbol, updateLastCandle, setOrderBook, setIsLoading]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (depthWsRef.current) {
        depthWsRef.current.close();
      }
    };
  }, [connect]);

  return { reconnect: connect };
}
