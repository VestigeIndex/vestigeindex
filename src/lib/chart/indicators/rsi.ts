// Relative Strength Index (RSI) calculation

export interface RSIResult {
  time: number;
  value: number;
}

export function calculateRSI(data: number[], period: number = 14): RSIResult[] {
  if (data.length < period + 1) return [];

  const results: RSIResult[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  // First average gain and loss
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // Calculate RSI for first point
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));
  results.push({ time: period, value: rsi });

  // Calculate remaining RSI values using smoothed averages
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
    results.push({ time: i + 1, value: rsi });
  }

  return results;
}

export function calculateRSIOnCandles(candles: { close: number; time: number }[], period: number = 14): RSIResult[] {
  const closes = candles.map(c => c.close);
  const times = candles.map(c => c.time);
  const rsiResults = calculateRSI(closes, period);
  
  return rsiResults.map((result) => ({
    time: times[result.time],
    value: result.value
  }));
}