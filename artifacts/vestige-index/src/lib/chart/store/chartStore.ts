// Chart state management with Zustand

import { create } from 'zustand';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface ChartState {
  // Candle data
  candles: Candle[];
  setCandles: (candles: Candle[]) => void;
  updateLastCandle: (candle: Candle) => void;
  
  // Symbol
  symbol: string;
  setSymbol: (symbol: string) => void;
  
  // View state
  zoom: number;
  offset: number;
  setZoom: (zoom: number) => void;
  setOffset: (offset: number) => void;
  
  // Crosshair
  crosshairX: number | null;
  crosshairY: number | null;
  setCrosshair: (x: number | null, y: number | null) => void;
  
  // Interaction
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  
  // Price range
  priceMin: number;
  priceMax: number;
  setPriceRange: (min: number, max: number) => void;
  
  // Order book
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  setOrderBook: (bids: OrderBookEntry[], asks: OrderBookEntry[]) => void;
  
  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useChartStore = create<ChartState>((set) => ({
  // Candle data
  candles: [],
  setCandles: (candles) => set({ candles }),
  updateLastCandle: (candle) => set((state) => {
    if (state.candles.length === 0) return { candles: [candle] };
    const newCandles = [...state.candles];
    newCandles[newCandles.length - 1] = candle;
    return { candles: newCandles };
  }),
  
  // Symbol
  symbol: 'BTCUSDT',
  setSymbol: (symbol) => set({ symbol }),
  
  // View state
  zoom: 1,
  offset: 0,
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(10, zoom)) }),
  setOffset: (offset) => set({ offset }),
  
  // Crosshair
  crosshairX: null,
  crosshairY: null,
  setCrosshair: (x, y) => set({ crosshairX: x, crosshairY: y }),
  
  // Interaction
  isDragging: false,
  setIsDragging: (isDragging) => set({ isDragging }),
  
  // Price range
  priceMin: 0,
  priceMax: 0,
  setPriceRange: (priceMin, priceMax) => set({ priceMin, priceMax }),
  
  // Order book
  bids: [],
  asks: [],
  setOrderBook: (bids, asks) => set({ bids, asks }),
  
  // Loading state
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
