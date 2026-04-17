import React, { useEffect, useRef, useState, useCallback } from "react";
import { createChart, ColorType, CrosshairMode } from "lightweight-charts";

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface TradingChartProps {
  symbol: string;
  height?: number;
  darkMode?: boolean;
}


// Mapeo de símbolos de CoinGecko a Binance
const SYMBOL_MAP: Record<string, string> = {
  'BTC': 'BTCUSDT', 'ETH': 'ETHUSDT', 'BNB': 'BNBUSDT', 'SOL': 'SOLUSDT',
  'XRP': 'XRPUSDT', 'ADA': 'ADAUSDT', 'DOGE': 'DOGEUSDT', 'DOT': 'DOTUSDT',
  'MATIC': 'MATICUSDT', 'LINK': 'LINKUSDT', 'UNI': 'UNIUSDT', 'AVAX': 'AVAXUSDT',
  'ATOM': 'ATOMUSDT', 'LTC': 'LTCUSDT', 'ETC': 'ETCUSDT', 'XLM': 'XLMUSDT',
  'ALGO': 'ALGOUSDT', 'VET': 'VETUSDT', 'FIL': 'FILUSDT', 'THETA': 'THETAUSDT',
  'AXS': 'AXSUSDT', 'MANA': 'MANAUSDT', 'SAND': 'SANDUSDT', 'GALA': 'GALAUSDT',
  'AAVE': 'AAVEUSDT', 'SNX': 'SNXUSDT', 'CRV': 'CRVUSDT', 'COMP': 'COMPUSDT',
  'MKR': 'MKRUSDT', 'SUSHI': 'SUSHIUSDT', 'YFI': 'YFIUSDT', 'BAL': 'BALUSDT',
  'GRT': 'GRTUSDT', 'ENS': 'ENSUSDT', '1INCH': '1INCHUSDT', 'ARB': 'ARBUSDT',
  'OP': 'OPUSDT', 'SHIB': 'SHIBUSDT', 'PEPE': 'PEPEUSDT', 'LDO': 'LDOUSDT',
  'APT': 'APTUSDT', 'NEAR': 'NEARUSDT', 'INJ': 'INJUSDT', 'TIA': 'TIAUSDT',
  'SEI': 'SEIUSDT', 'SUI': 'SUIUSDT', 'FTM': 'FTMUSDT', 'HBAR': 'HBARUSDT',
  'XMR': 'XMRUSDT', 'ZEC': 'ZECUSDT', 'DASH': 'DASHUSDT', 'NEO': 'NEOUSDT',
  'KAVA': 'KAVAUSDT', 'CAKE': 'CAKEUSDT', 'RUNE': 'RUNEUSDT', 'KSM': 'KSMUSDT',
  'CRO': 'CROUSDT', 'QNT': 'QNTUSDT', 'EGLD': 'EGLDUSDT', 'MINA': 'MINAUSDT',
  'IMX': 'IMXUSDT', 'STX': 'STXUSDT', 'BONK': 'BONKUSDT', 'WIF': 'WIFUSDT',
  'JUP': 'JUPUSDT', 'BTT': 'BTTUSDT', 'TRX': 'TRXUSDT', 'TON': 'TONUSDT',
  'XTZ': 'XTZUSDT', 'IOTA': 'IOTAUSDT', 'NEXO': 'NEXOUSDT', 'STELLAR': 'XLMUSDT',
  'USDT': 'USDCUSDT', 'USDC': 'USDCUSDT', 'DAI': 'DAIUSDT', 'BUSD': 'BUSDUSDT',
  'TUSD': 'TUSDUSDT',
};

const KNOWN_BINANCE_SYMBOLS = new Set(Object.values(SYMBOL_MAP));

function getBinanceSymbol(symbol: string): string | null {
  const upper = symbol.toUpperCase();
  if (SYMBOL_MAP[upper]) return SYMBOL_MAP[upper];
  const direct = `${upper}USDT`;
  return KNOWN_BINANCE_SYMBOLS.has(direct) ? direct : null;
}


const TIME_RANGES = [
  { label: "1D", days: 1, interval: "15m" },
  { label: "1S", days: 7, interval: "1h" },
  { label: "1M", days: 30, interval: "4h" },
  { label: "3M", days: 90, interval: "1d" },
  { label: "1Y", days: 365, interval: "1d" },
  { label: "ALL", days: 1000, interval: "1w" },
];

export default function TradingChart({ 
  symbol, 
  height = 400,
  darkMode = true 
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  
  const [data, setData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES[2]); // Default 1M

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const limit = Math.min(selectedRange.days * 24, 500); // Max 500 candles
      const upperSymbol = symbol.toUpperCase();
      
      // Get the proper Binance symbol (try mapped first, then direct)
      let binanceSymbol = getBinanceSymbol(upperSymbol);
      
      // If not found in map, try direct format
      if (!binanceSymbol) {
        binanceSymbol = `${upperSymbol}USDT`;
      }
      
      const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${selectedRange.interval}&limit=${limit}`;
      
      // Retry with exponential backoff
      let lastError: Error | null = null;
      for (let i = 0; i < 3; i++) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            // Try alternative symbol format if 400 error
            if (response.status === 400 && i === 0) {
              // Try with different base asset
              const altSymbol = `${upperSymbol.toUpperCase()}USDT`;
              const altUrl = `https://api.binance.com/api/v3/klines?symbol=${altSymbol}&interval=${selectedRange.interval}&limit=${limit}`;
              const altResponse = await fetch(altUrl);
              if (altResponse.ok) {
                const klines = await altResponse.json();
                const candleData: CandleData[] = klines.map((k: any) => ({
                  time: Math.floor(k[0] / 1000),
                  open: parseFloat(k[1]),
                  high: parseFloat(k[2]),
                  low: parseFloat(k[3]),
                  close: parseFloat(k[4]),
                  volume: parseFloat(k[5]),
                }));
                setData(candleData);
                setLoading(false);
                return;
              }
            }
            throw new Error("Failed to fetch data");
          }
          
          const klines = await response.json();
          const candleData: CandleData[] = klines.map((k: any) => ({
            time: Math.floor(k[0] / 1000),
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
          }));
          
          setData(candleData);
          setLoading(false);
          return;
        } catch (e) {
          lastError = e as Error;
          // Wait before retry: 1s, 2s
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        }
      }
      throw lastError;
    } catch (err: any) {
      console.error("Chart data error:", err);
      setError("No hay datos de gráfico disponibles para este token");
    } finally {
      setLoading(false);
    }
  }, [symbol, selectedRange]);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    // Destroy previous chart if exists
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: darkMode ? "#94a3b8" : "#475569",
        fontFamily: "system-ui, -apple-system, sans-serif",
      },
      grid: {
        vertLines: { color: darkMode ? "#1e293b" : "#e2e8f0" },
        horzLines: { color: darkMode ? "#1e293b" : "#e2e8f0" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: darkMode ? "#64748b" : "#94a3b8",
          labelBackgroundColor: darkMode ? "#334155" : "#cbd5e1",
        },
        horzLine: {
          color: darkMode ? "#64748b" : "#94a3b8",
          labelBackgroundColor: darkMode ? "#334155" : "#cbd5e1",
        },
      },
      rightPriceScale: {
        borderColor: darkMode ? "#334155" : "#cbd5e1",
      },
      timeScale: {
        borderColor: darkMode ? "#334155" : "#cbd5e1",
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: height,
    });

    // Candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candlestickSeries.setData(data.map(d => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })));

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
      color: "#3b82f6",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    volumeSeries.setData(data.map(d => ({
      time: d.time,
      value: d.volume || 0,
      color: d.close >= d.open ? "#22c55e40" : "#ef444440",
    })));

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, darkMode, height]);

  if (loading && !data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-muted-foreground">Cargando gráfico...</div>
      </div>
    );
  }

  if (error && !data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Time range selector */}
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {TIME_RANGES.map((range) => (
          <button
            key={range.label}
            onClick={() => setSelectedRange(range)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              selectedRange.label === range.label
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {range.label}
          </button>
        ))}
        <button
          onClick={fetchData}
          className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded ml-auto"
        >
          🔄
        </button>
      </div>

      {/* Chart container */}
      <div ref={containerRef} className="w-full" style={{ height }} />
      
      {/* Stats */}
      {data.length > 0 && (
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span>O: {data[data.length - 1]?.open.toFixed(2)}</span>
          <span>H: {data[data.length - 1]?.high.toFixed(2)}</span>
          <span>L: {data[data.length - 1]?.low.toFixed(2)}</span>
          <span>C: {data[data.length - 1]?.close.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

// Simple sparkline for table rows
export function SparklineChart({ 
  data, 
  width = 100, 
  height = 32,
  color = "#22c55e" 
}: { 
  data: number[]; 
  width?: number; 
  height?: number;
  color?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "transparent" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      width,
      height,
    });

    const lineSeries = chart.addLineSeries({
      color,
      lineWidth: 1.5,
      crosshairMarkerVisible: false,
      lastPriceAnimation: 0,
    });

    const chartData = data.map((value, index) => ({ time: index, value }));
    lineSeries.setData(chartData);

    chart.applyOptions({ 
      handleScroll: false, 
      handleScale: false,
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    chartRef.current = chart;

    return () => {
      chart.remove();
    };
  }, [data, width, height, color]);

  return <div ref={containerRef} style={{ width, height }} />;
}