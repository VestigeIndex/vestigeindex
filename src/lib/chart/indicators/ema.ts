// Exponential Moving Average (EMA) calculation

export interface EMAResult {
  time: number;
  value: number;
}

export function calculateEMA(data: number[], period: number): EMAResult[] {
  if (data.length < period) return [];

  const multiplier = 2 / (period + 1);
  const results: EMAResult[] = [];
  
  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  let ema = sum / period;
  results.push({ time: period - 1, value: ema });

  // Calculate remaining EMAs
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    results.push({ time: i, value: ema });
  }

  return results;
}

export function calculateEMAOnCandles(candles: { close: number; time: number }[], period: number): EMAResult[] {
  const closes = candles.map(c => c.close);
  const times = candles.map(c => c.time);
  const emaResults = calculateEMA(closes, period);
  
  return emaResults.map((result) => ({
    time: times[result.time],
    value: result.value
  }));
}