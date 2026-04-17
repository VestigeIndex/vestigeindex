// Technical Indicators for Charts
// Free calculations, no API key required

import type { CandleData } from "../components/TradingChart";

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: CandleData[], period: number): { time: number; value: number }[] {
  if (data.length < period) return [];
  
  const result: { time: number; value: number }[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, candle) => acc + candle.close, 0);
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  
  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: CandleData[], period: number): { time: number; value: number }[] {
  if (data.length < period) return [];
  
  const result: { time: number; value: number }[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;
  
  result.push({
    time: data[period - 1].time,
    value: ema,
  });
  
  // Calculate remaining EMAs
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({
      time: data[i].time,
      value: ema,
    });
  }
  
  return result;
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  data: CandleData[], 
  period: number = 20, 
  stdDev: number = 2
): { 
  middle: { time: number; value: number }[];
  upper: { time: number; value: number }[];
  lower: { time: number; value: number }[];
} {
  if (data.length < period) {
    return { middle: [], upper: [], lower: [] };
  }
  
  const middle: { time: number; value: number }[] = [];
  const upper: { time: number; value: number }[] = [];
  const lower: { time: number; value: number }[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const closes = slice.map(d => d.close);
    
    // Middle band (SMA)
    const sma = closes.reduce((acc, v) => acc + v, 0) / period;
    
    // Standard deviation
    const variance = closes.reduce((acc, v) => acc + Math.pow(v - sma, 2), 0) / period;
    const sd = Math.sqrt(variance);
    
    middle.push({ time: data[i].time, value: sma });
    upper.push({ time: data[i].time, value: sma + stdDev * sd });
    lower.push({ time: data[i].time, value: sma - stdDev * sd });
  }
  
  return { middle, upper, lower };
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(data: CandleData[], period: number = 14): { time: number; value: number }[] {
  if (data.length < period + 1) return [];
  
  const result: { time: number; value: number }[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  
  // First average gain/loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // RS value
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));
  
  result.push({
    time: data[period].time,
    value: rsi,
  });
  
  // Subsequent values use smoothed averages
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
    
    result.push({
      time: data[i].time,
      value: rsi,
    });
  }
  
  return result;
}

/**
 * Calculate MACD
 */
export function calculateMACD(
  data: CandleData[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): {
  macd: { time: number; value: number }[];
  signal: { time: number; value: number }[];
  histogram: { time: number; value: number }[];
} {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  if (fastEMA.length === 0 || slowEMA.length === 0) {
    return { macd: [], signal: [], histogram: [] };
  }
  
  // MACD line = Fast EMA - Slow EMA
  const macdLine: { time: number; value: number }[] = [];
  const startIdx = slowPeriod - fastPeriod;
  
  for (let i = 0; i < slowEMA.length; i++) {
    const fastIdx = i + startIdx;
    if (fastIdx < fastEMA.length) {
      macdLine.push({
        time: slowEMA[i].time,
        value: fastEMA[fastIdx].value - slowEMA[i].value,
      });
    }
  }
  
  // Signal line = EMA of MACD
  const signal: { time: number; value: number }[] = [];
  const signalMultiplier = 2 / (signalPeriod + 1);
  
  if (macdLine.length < signalPeriod) {
    return { macd: macdLine, signal: [], histogram: [] };
  }
  
  let sum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    sum += macdLine[i].value;
  }
  let ema = sum / signalPeriod;
  
  signal.push({
    time: macdLine[signalPeriod - 1].time,
    value: ema,
  });
  
  for (let i = signalPeriod; i < macdLine.length; i++) {
    ema = (macdLine[i].value - ema) * signalMultiplier + ema;
    signal.push({
      time: macdLine[i].time,
      value: ema,
    });
  }
  
  // Histogram = MACD - Signal
  const histogram: { time: number; value: number }[] = [];
  const histStartIdx = signalPeriod - 1;
  
  for (let i = 0; i < signal.length; i++) {
    const macdIdx = i + histStartIdx;
    if (macdIdx < macdLine.length) {
      histogram.push({
        time: signal[i].time,
        value: macdLine[macdIdx].value - signal[i].value,
      });
    }
  }
  
  return { macd: macdLine, signal, histogram };
}

/**
 * Calculate Volume Profile
 */
export function calculateVolumeProfile(data: CandleData[]): { time: number; value: number; color: string }[] {
  return data.map((candle, i) => ({
    time: candle.time,
    value: candle.volume || 0,
    color: i > 0 && candle.close >= (data[i - 1]?.close || 0) 
      ? "#22c55e80" 
      : "#ef444480",
  }));
}

/**
 * Get Fear & Greed Index (free, no API key)
 */
export async function getFearGreedIndex(): Promise<{
  value: number;
  label: string;
  timestamp: number;
} | null> {
  try {
    const response = await fetch("https://api.alternative.me/fng/");
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const latest = data.data[0];
      const value = parseInt(latest.value);
      
      let label = "Neutral";
      if (value <= 25) label = "Extreme Fear";
      else if (value <= 45) label = "Fear";
      else if (value <= 55) label = "Neutral";
      else if (value <= 75) label = "Greed";
      else label = "Extreme Greed";
      
      return {
        value,
        label,
        timestamp: parseInt(latest.timestamp),
      };
    }
    return null;
  } catch (error) {
    console.error("Fear & Greed API error:", error);
    return null;
  }
}

/**
 * Get Open Interest for BTC (Bybit free API)
 */
export async function getOpenInterest(symbol: string = "BTCUSDT"): Promise<{
  openInterest: number;
  change24h: number;
} | null> {
  try {
    const response = await fetch(
      `https://api.bybit.com/v5/market/open-interest?symbol=${symbol}&intervalTime=15min&limit=1`
    );
    const data = await response.json();
    
    if (data.result && data.result.list) {
      const latest = data.result.list[0];
      return {
        openInterest: parseFloat(latest.openInterest),
        change24h: parseFloat(latest.change),
      };
    }
    return null;
  } catch (error) {
    console.error("Open Interest API error:", error);
    return null;
  }
}

/**
 * Get On-Chain Data (Multiple free sources)
 */
export async function getOnChainData(symbol: string = "BTC"): Promise<{
  fearGreed: { value: number; label: string } | null;
  openInterest: { openInterest: number; change24h: number } | null;
  exchangeFlows: { exchange: string; inflow: number; outflow: number } | null;
}> {
  const [fearGreed, openInterest] = await Promise.all([
    getFearGreedIndex(),
    symbol.toUpperCase().includes("BTC") ? getOpenInterest("BTCUSDT") : Promise.resolve(null),
  ]);
  
  return {
    fearGreed: fearGreed ? { value: fearGreed.value, label: fearGreed.label } : null,
    openInterest,
    exchangeFlows: null, // Could add more APIs here
  };
}