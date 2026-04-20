// TradingChart - Professional chart with Binance data and local caching

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MainChart } from "./components/Chart/MainChart";
import { OrderBook } from "./components/OrderBook/OrderBook";
import { useChartStore } from "./store/chartStore";

// Mapeo de símbolos a Binance
const SYMBOL_MAP: Record<string, string> = {
  'BTC': 'BTCUSDT', 'ETH': 'ETHUSDT', 'BNB': 'BNBUSDT', 'SOL': 'SOLUSDT',
  'XRP': 'XRPUSDT', 'ADA': 'ADAUSDT', 'DOGE': 'DOGEUSDT', 'DOT': 'DOTUSDT',
  'MATIC': 'POLUSDT', 'LINK': 'LINKUSDT', 'UNI': 'UNIUSDT', 'AVAX': 'AVAXUSDT',
  'ATOM': 'ATOMUSDT', 'LTC': 'LTCUSDT', 'ETC': 'ETCUSDT', 'XLM': 'XLMUSDT',
  'ALGO': 'ALGOUSDT', 'VET': 'VETUSDT', 'FIL': 'FILUSDT', 'THETA': 'THETAUSDT',
  'AXS': 'AXSUSDT', 'MANA': 'MANAUSDT', 'SAND': 'SANDUSDT', 'GALA': 'GALAUSDT',
  'AAVE': 'AAVEUSDT', 'CRV': 'CRVUSDT', 'COMP': 'COMPUSDT', 'MKR': 'MKRUSDT',
  'GRT': 'GRTUSDT', 'ENS': 'ENSUSDT', '1INCH': '1INCHUSDT', 'ARB': 'ARBUSDT',
  'OP': 'OPUSDT', 'SHIB': 'SHIBUSDT', 'PEPE': 'PEPEUSDT', 'LDO': 'LDOUSDT',
  'APT': 'APTUSDT', 'NEAR': 'NEARUSDT', 'INJ': 'INJUSDT', 'TIA': 'TIAUSDT',
  'SEI': 'SEIUSDT', 'SUI': 'SUIUSDT', 'FTM': 'FTMUSDT', 'HBAR': 'HBARUSDT',
  'XMR': 'XMRUSDT', 'ZEC': 'ZECUSDT', 'DASH': 'DASHUSDT', 'NEO': 'NEOUSDT',
  'CAKE': 'CAKEUSDT', 'RUNE': 'RUNEUSDT', 'CRO': 'CROUSDT', 'QNT': 'QNTUSDT',
  'EGLD': 'EGLDUSDT', 'IMX': 'IMXUSDT', 'STX': 'STXUSDT', 'BONK': 'BONKUSDT',
  'WIF': 'WIFUSDT', 'JUP': 'JUPUSDT', 'TRX': 'TRXUSDT', 'TON': 'TONUSDT',
  'XTZ': 'XTZUSDT', 'IOTA': 'IOTAUSDT', 'NEXO': 'NEXOUSDT',
  'USDT': 'USDCUSDT', 'USDC': 'USDCUSDT', 'DAI': 'DAIUSDT',
  'TUSD': 'TUSDUSDT',
};

function getBinanceSymbol(symbol: string): string {
  const upper = symbol.toUpperCase();
  return SYMBOL_MAP[upper] || `${upper}USDT`;
}

const TIME_RANGES = [
  { label: "1D", hours: 24, interval: "15m" },
  { label: "1S", hours: 168, interval: "1h" },
  { label: "1M", hours: 720, interval: "4h" },
  { label: "3M", hours: 2160, interval: "1d" },
  { label: "1A", hours: 8760, interval: "1d" },
];

interface TradingChartProps {
  symbol: string;
  height?: number;
}

export default function TradingChart({ symbol, height = 500 }: TradingChartProps) {
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES[1]); // Default 1S
  const setSymbol = useChartStore((state) => state.setSymbol);
  const candles = useChartStore((state) => state.candles);
  const isLoading = useChartStore((state) => state.isLoading);
  
  // Convert symbol to Binance format
  const binanceSymbol = getBinanceSymbol(symbol);
  
  // Update symbol in store
  useEffect(() => {
    setSymbol(binanceSymbol);
  }, [binanceSymbol, setSymbol]);

  // Load data when range changes
  useEffect(() => {
    // The useCandles hook will automatically reload when symbol changes
  }, [binanceSymbol, selectedRange]);

  const handleRangeChange = (range: typeof TIME_RANGES[0]) => {
    setSelectedRange(range);
  };

  const currentPrice = candles.length > 0 ? candles[candles.length - 1].close : 0;
  const previousPrice = candles.length > 1 ? candles[candles.length - 2].close : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

  return (
    <div className="w-full">
      {/* Header with price */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">{symbol}/USDT</h2>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-mono font-bold ${
              priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-mono ${
              priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        {/* Time range selector */}
        <div className="flex items-center gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => handleRangeChange(range)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                selectedRange.label === range.label
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart and OrderBook */}
      <div className="flex gap-4">
        <div className="flex-1">
          <MainChart symbol={binanceSymbol} height={height} />
        </div>
        <div className="w-64 shrink-0">
          <OrderBook />
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-2 text-xs text-muted-foreground">
          Cargando datos de Binance...
        </div>
      )}
    </div>
  );
}
