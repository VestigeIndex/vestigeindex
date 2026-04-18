// Moving Average Convergence Divergence (MACD) calculation

export interface MACDResult {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

export function calculateMACD(
  data: number[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): MACDResult[] {
  if (data.length < slowPeriod + signalPeriod) return [];

  // Calculate EMAs
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  // Align EMAs
  const alignedFast = fastEMA.filter(e => e.time >= slowPeriod - 1);
  
  // Calculate MACD line
  const macdLine: { time: number; value: number }[] = [];
  for (let i = 0; i < alignedFast.length; i++) {
    const slowEmaValue = slowEMA.find(e => e.time === alignedFast[i].time);
    if (slowEmaValue) {
      macdLine.push({
        time: alignedFast[i].time,
        value: alignedFast[i].value - slowEmaValue.value
      });
    }
  }

  // Calculate Signal line (EMA of MACD)
  const signalLine = calculateEMA(macdLine.map(m => m.value), signalPeriod);

  // Build results
  const results: MACDResult[] = [];
  
  for (let i = 0; i < macdLine.length; i++) {
    const time = macdLine[i].time;
    const macd = macdLine[i].value;
    const signal = signalLine.find(s => s.time === i)?.value ?? 0;
    const histogram = macd - signal;
    
    results.push({
      time,
      macd,
      signal,
      histogram
    });
  }

  return results;
}

// Simple EMA helper
function calculateEMA(data: number[], period: number): { time: number; value: number }[] {
  if (data.length < period) return [];

  const multiplier = 2 / (period + 1);
  const results: { time: number; value: number }[] = [];
  
  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  let ema = sum / period;
  results.push({ time: period - 1, value: ema });

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    results.push({ time: i, value: ema });
  }

  return results;
}

export function calculateMACDOnCandles(
  candles: { close: number; time: number }[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult[] {
  const closes = candles.map(c => c.close);
  const times = candles.map(c => c.time);
  const macdResults = calculateMACD(closes, fastPeriod, slowPeriod, signalPeriod);
  
  return macdResults.map(result => ({
    time: times[result.time],
    macd: result.macd,
    signal: result.signal,
    histogram: result.histogram
  }));
}