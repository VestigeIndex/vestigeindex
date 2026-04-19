import { useEffect, useRef, useState } from 'react';
import './CandlestickChart.css';

type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M' | '1y';

interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  symbol: string;
  onClose?: () => void;
  onBuy?: (symbol: string) => void;
  onSell?: (symbol: string) => void;
}

const timeframeToInterval: Record<Timeframe, string> = {
  '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
  '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w', '1M': '1M', '1y': '1M'
};

const timeframeToLimit: Record<Timeframe, number> = {
  '1m': 500, '5m': 500, '15m': 500, '30m': 500,
  '1h': 500, '4h': 500, '1d': 365, '1w': 104, '1M': 60, '1y': 12
};

// Map symbols to Binance format
const symbolMap: Record<string, string> = {
  'BTC': 'BTCUSDT', 'ETH': 'ETHUSDT', 'BNB': 'BNBUSDT', 'SOL': 'SOLUSDT',
  'XRP': 'XRPUSDT', 'ADA': 'ADAUSDT', 'DOGE': 'DOGEUSDT', 'DOT': 'DOTUSDT',
  'MATIC': 'MATICUSDT', 'LINK': 'LINKUSDT', 'AVAX': 'AVAXUSDT', 'ATOM': 'ATOMUSDT',
  'LTC': 'LTCUSDT', 'ETC': 'ETCUSDT', 'XLM': 'XLMUSDT', 'FIL': 'FILUSDT',
  'UNI': 'UNIUSDT', 'AAVE': 'AAVEUSDT', 'MKR': 'MKRUSDT', 'SOLANA': 'SOLUSDT',
  'RIPPLE': 'XRPUSDT', 'CARDANO': 'ADAUSDT', 'POLKADOT': 'DOTUSDT',
};

function getBinanceSymbol(symbol: string): string {
  const upper = symbol.toUpperCase();
  if (symbolMap[upper]) return symbolMap[upper];
  // Default: add USDT
  if (!upper.endsWith('USDT')) {
    return `${upper}USDT`;
  }
  return upper;
}

function getCMCSlug(symbol: string): string {
  const slugs: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'BNB': 'bnb',
    'SOL': 'solana',
    'XRP': 'xrp',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'LINK': 'chainlink',
    'MATIC': 'polygon',
    'AVAX': 'avalanche',
    'LTC': 'litecoin',
    'TRX': 'tron',
    'ETC': 'ethereum-classic',
    'ATOM': 'cosmos',
    'ALGO': 'algorand',
    'VET': 'vechain',
    'FIL': 'filecoin',
    'THETA': 'theta',
    'EGLD': 'elrond',
    'XTZ': 'tezos',
    'EOS': 'eos',
    'KSM': 'kusama',
    'DPI': 'defi-pulse-index',
    'MVI': 'metaverse-index',
    'PAXG': 'pax-gold',
  };
  return slugs[symbol.toUpperCase()] || symbol.toLowerCase();
}

export function CandlestickChart({ symbol, onClose, onBuy, onSell }: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1d');
  const [data, setData] = useState<KlineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: KlineData | null }>({ x: 0, y: 0, data: null });

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M', '1y'];

  useEffect(() => {
    loadData();
  }, [symbol, timeframe]);

  useEffect(() => {
    if (data.length > 0 && canvasRef.current && containerRef.current) {
      // Small delay to ensure container is rendered
      setTimeout(() => drawChart(), 50);
    }
  }, [data, zoomLevel, startIndex, timeframe]);

  useEffect(() => {
    // Handle resize
    const handleResize = () => {
      if (data.length > 0) {
        drawChart();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data]);

  async function loadData() {
    setLoading(true);
    const binanceSymbol = getBinanceSymbol(symbol);
    
    try {
      const interval = timeframeToInterval[timeframe];
      const limit = timeframeToLimit[timeframe];
      const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Binance API error');
      }
      
      const rawData = await response.json();
      
      const klines: KlineData[] = rawData.map((k: any) => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
      }));
      
      setData(klines);
    } catch (error) {
      console.error('Error loading chart data:', error);
      // Generate placeholder data on error
      const placeholderData: KlineData[] = [];
      const now = Math.floor(Date.now() / 1000);
      const basePrice = symbol.toUpperCase().includes('BTC') ? 65000 : 
                        symbol.toUpperCase().includes('ETH') ? 3000 : 100;
      for (let i = 0; i < 60; i++) {
        const variance = basePrice * 0.03;
        placeholderData.push({
          time: now - (60 - i) * 3600 * 24,
          open: basePrice + (Math.random() - 0.5) * variance,
          high: basePrice + Math.random() * variance,
          low: basePrice - Math.random() * variance,
          close: basePrice + (Math.random() - 0.5) * variance,
          volume: Math.random() * 1000000,
        });
      }
      setData(placeholderData);
    }
    setLoading(false);
  }

  function drawChart() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = container.clientWidth - 32;
    const height = 400;
    canvas.width = width;
    canvas.height = height;
    
    const visibleCount = Math.floor(data.length / zoomLevel);
    const visibleData = data.slice(startIndex, startIndex + visibleCount);
    if (visibleData.length === 0) return;
    
    const maxPrice = Math.max(...visibleData.map(d => d.high));
    const minPrice = Math.min(...visibleData.map(d => d.low));
    const priceRange = maxPrice - minPrice || 1;
    const candleWidth = Math.max(2, (width - 80) / visibleData.length - 2);
    
    // Background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#888';
    ctx.font = '10px monospace';
    
    for (let i = 0; i <= 4; i++) {
      const y = 40 + (i * (height - 80) / 4);
      const price = maxPrice - (i * priceRange / 4);
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
      ctx.fillText(price.toFixed(2), 10, y + 3);
    }
    
    // Candles
    for (let i = 0; i < visibleData.length; i++) {
      const candle = visibleData[i];
      const x = 60 + i * (candleWidth + 2);
      const openY = 40 + ((maxPrice - candle.open) / priceRange) * (height - 80);
      const closeY = 40 + ((maxPrice - candle.close) / priceRange) * (height - 80);
      const highY = 40 + ((maxPrice - candle.high) / priceRange) * (height - 80);
      const lowY = 40 + ((maxPrice - candle.low) / priceRange) * (height - 80);
      
      const isBullish = candle.close >= candle.open;
      ctx.fillStyle = isBullish ? '#00FF00' : '#FF0000';
      ctx.fillRect(x, Math.min(openY, closeY), candleWidth, Math.max(1, Math.abs(closeY - openY)));
      
      // Wick
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();
    }
    
    // Tooltip
    if (tooltip.data) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(tooltip.x + 10, tooltip.y - 30, 150, 50);
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`O: ${tooltip.data.open.toFixed(2)}`, tooltip.x + 15, tooltip.y - 20);
      ctx.fillText(`H: ${tooltip.data.high.toFixed(2)} | L: ${tooltip.data.low.toFixed(2)}`, tooltip.x + 15, tooltip.y - 10);
      ctx.fillText(`C: ${tooltip.data.close.toFixed(2)}`, tooltip.x + 15, tooltip.y);
    }
  }

  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 0.5, 5));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 0.5, 0.5));
  const handleReset = () => { setZoomLevel(1); setStartIndex(0); };
  
  const handleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${symbol}_${timeframe}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const visibleCount = Math.floor(data.length / zoomLevel);
    const visibleData = data.slice(startIndex, startIndex + visibleCount);
    const x = e.clientX - rect.left;
    const candleIndex = Math.floor((x - 60) / ((rect.width - 80) / visibleData.length));
    if (candleIndex >= 0 && candleIndex < visibleData.length) {
      setTooltip({ x, y: e.clientY - rect.top, data: visibleData[candleIndex] });
    } else {
      setTooltip({ x: 0, y: 0, data: null });
    }
  };

  return (
    <div ref={containerRef} className="candlestick-chart-container">
      <div className="chart-header">
        <div className="timeframes">
          {timeframes.map(tf => (
            <button key={tf} className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`} onClick={() => setTimeframe(tf)}>
              {tf}
            </button>
          ))}
        </div>
        <div className="chart-controls">
          <button onClick={handleZoomIn}>🔍+</button>
          <button onClick={handleZoomOut}>🔍-</button>
          <button onClick={handleReset}>⟳</button>
          <button onClick={handleFullscreen}>⛶</button>
          <button onClick={handleDownload}>💾</button>
          {onClose && <button onClick={onClose}>✕</button>}
        </div>
      </div>
      {loading ? (
        <div className="chart-loading">Cargando gráfico...</div>
      ) : (
        <canvas ref={canvasRef} className="chart-canvas" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip({ x: 0, y: 0, data: null })} />
      )}
      
      {/* Botón CoinMarketCap - Esquina inferior izquierda */}
      <button 
        onClick={() => window.open(`https://coinmarketcap.com/currencies/${getCMCSlug(symbol)}/`, '_blank')} 
        title="Ver en CoinMarketCap"
        className="absolute bottom-4 left-4 bg-white hover:bg-gray-100 rounded-lg shadow-lg z-10"
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/2/2e/Coinmarketcap_svg_logo.svg" 
          alt="CMC" 
          className="h-12 w-auto object-contain" 
        />
      </button>
      
      {/* Botones COMPRAR y VENDER - Esquina inferior derecha */}
      {(onBuy || onSell) && (
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          {onBuy && (
            <button
              onClick={() => onBuy(symbol)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg font-medium transition text-sm"
            >
              🟢 COMPRAR
            </button>
          )}
          {onSell && (
            <button
              onClick={() => onSell(symbol)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg font-medium transition text-sm"
            >
              🔴 VENDER
            </button>
          )}
        </div>
      )}
    </div>
  );
}