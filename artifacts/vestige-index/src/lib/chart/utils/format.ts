// Formatting utilities for chart display

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatCurrency(num: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: num < 1 ? 6 : 2
  }).format(num);
}

export function formatPercent(num: number): string {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

export function formatCandleTime(ts: number): string {
  const date = new Date(ts);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`;
}

export function formatOHLC(data: { 
  time: number; 
  open: number; 
  high: number; 
  low: number; 
  close: number;
  volume?: number;
}): string {
  return `O: ${formatCurrency(data.open)} H: ${formatCurrency(data.high)} L: ${formatCurrency(data.low)} C: ${formatCurrency(data.close)}`;
}