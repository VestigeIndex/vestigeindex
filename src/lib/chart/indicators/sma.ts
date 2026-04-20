// Simple Moving Average (SMA) calculation

export interface SMAResult {
  time: number;
  value: number;
}

export function calculateSMA(data: number[], period: number): SMAResult[] {
  if (data.length < period) return [];

  const results: SMAResult[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    results.push({
      time: i,
      value: sum / period
    });
  }

  return results;
}

export function calculateSMAOnCandles(candles: { close: number; time: number }[], period: number): SMAResult[] {
  const closes = candles.map(c => c.close);
  const times = candles.map(c => c.time);
  const smaResults = calculateSMA(closes, period);
  
  return smaResults.map((result, index) => ({
    time: times[result.time],
    value: result.value
  }));
}