import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, TrendingUp, TrendingDown, ZoomIn, ZoomOut } from 'lucide-react';
import { ethers } from 'ethers';
import { getSwapQuote, toDecimals } from '../lib/swapService';

interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TooltipData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  price: number;
  x: number;
  y: number;
}

interface ProChartProps {
  symbol: string;
  userAddress?: string;
  chainId?: number;
}

export default function ProChart({ symbol, userAddress, chainId = 1 }: ProChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<KlineData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<'1D' | '1S' | '1M' | '3M' | '1Y'>('1D');
  const [showSMA, setShowSMA] = useState<{ sma7: boolean; sma25: boolean; sma99: boolean }>({ sma7: true, sma25: true, sma99: false });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Binance API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const intervals = {
        '1D': '1d',
        '1S': '1w', 
        '1M': '1M',
        '3M': '3M',
        '1Y': '1Y'
      };

      const limits = {
        '1D': 24,
        '1S': 168,
        '1M': 30,
        '3M': 90,
        '1Y': 365
      };

      const interval = intervals[timeRange as keyof typeof intervals];
      const limit = limits[timeRange as keyof typeof limits];

      // Fetch klines data
      const klinesResponse = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`
      );
      const klinesData = await klinesResponse.json();

      const klines: KlineData[] = klinesData.map((k: any[]) => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
      }));

      // Fetch current price
      const priceResponse = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
      );
      const priceData = await priceResponse.json();
      const currentPrice = parseFloat(priceData.price);

      // Calculate price change
      const firstPrice = klines[0]?.open || currentPrice;
      const change = ((currentPrice - firstPrice) / firstPrice) * 100;

      setData(klines);
      setCurrentPrice(currentPrice);
      setPriceChange(change);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeRange]);

  // Calculate SMA
  const calculateSMA = (data: KlineData[], period: number) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc: number, curr: KlineData) => acc + curr.close, 0);
      sma.push({ time: data[i].time, value: sum / period });
    }
    return sma;
  };

  // Draw chart
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 40, right: 80, bottom: 60, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.fillStyle = isDarkMode ? '#000000' : '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Calculate price range
    const prices = data.map((d: any) => [d.open, d.high, d.low, d.close]).flat();
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Calculate x scale
    const xScale = (index: number) => {
      return padding.left + (index / (data.length - 1)) * chartWidth * zoom + offset.x;
    };

    // Calculate y scale
    const yScale = (price: number) => {
      return padding.top + (1 - (price - minPrice) / priceRange) * chartHeight + offset.y;
    };

    // Draw grid
    ctx.strokeStyle = isDarkMode ? '#333333' : '#E5E5E5';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - (i / 5) * priceRange;
      ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
      ctx.font = '11px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(4), padding.left - 10, y + 4);
    }

    // Vertical grid lines
    for (let i = 0; i <= 5; i++) {
      const x = padding.left + (i / 5) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }

    // Draw volume bars
    const maxVolume = Math.max(...data.map((d: KlineData) => d.volume));
    const volumeHeight = chartHeight * 0.2;
    
    data.forEach((candle: KlineData, index: number) => {
      const x = xScale(index);
      const volumeWidth = chartWidth / data.length * 0.8 * zoom;
      const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight;
      const volumeY = height - padding.bottom - volumeBarHeight;
      
      ctx.fillStyle = isDarkMode ? 'rgba(52, 211, 153, 0.3)' : 'rgba(34, 197, 94, 0.3)';
      ctx.fillRect(x - volumeWidth / 2, volumeY, volumeWidth, volumeBarHeight);
    });

    // Draw candlesticks
    data.forEach((candle, index) => {
      const x = xScale(index);
      const candleWidth = Math.max(1, chartWidth / data.length * 0.8 * zoom);
      
      const open = yScale(candle.open);
      const close = yScale(candle.close);
      const high = yScale(candle.high);
      const low = yScale(candle.low);

      // Determine color
      const isGreen = candle.close > candle.open;
      ctx.strokeStyle = isGreen ? '#10B981' : '#EF4444';
      ctx.fillStyle = isGreen ? '#10B981' : '#EF4444';

      // Draw wick
      ctx.beginPath();
      ctx.moveTo(x, high);
      ctx.lineTo(x, low);
      ctx.stroke();

      // Draw body
      const bodyTop = Math.min(open, close);
      const bodyBottom = Math.max(open, close);
      const bodyHeight = Math.abs(close - open);
      
      if (bodyHeight > 0) {
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      } else {
        ctx.fillRect(x - candleWidth / 2, bodyTop - 1, candleWidth, 1);
      }
    });

    // Draw SMA lines
    if (showSMA.sma7) {
      const sma7 = calculateSMA(data, 7);
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      sma7.forEach((point, index) => {
        const x = xScale(index + 6); // Offset for SMA
        const y = yScale(point.value);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    if (showSMA.sma25) {
      const sma25 = calculateSMA(data, 25);
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      sma25.forEach((point, index) => {
        const x = xScale(index + 24); // Offset for SMA
        const y = yScale(point.value);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    if (showSMA.sma99) {
      const sma99 = calculateSMA(data, 99);
      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 2;
      ctx.beginPath();
      sma99.forEach((point, index) => {
        const x = xScale(index + 98); // Offset for SMA
        const y = yScale(point.value);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw current price line
    const currentY = yScale(currentPrice);
    ctx.strokeStyle = isDarkMode ? '#FFFFFF' : '#000000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, currentY);
    ctx.lineTo(width - padding.right, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current price label
    ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
    ctx.fillRect(width - padding.right + 5, currentY - 10, 70, 20);
    ctx.fillStyle = isDarkMode ? '#000000' : '#FFFFFF';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(currentPrice.toFixed(4), width - padding.right + 10, currentY + 4);

  }, [data, currentPrice, isDarkMode, showSMA, zoom, offset]);

  // Mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = { top: 40, right: 80, bottom: 60, left: 80 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Find nearest data point
    const index = Math.round(((x - padding.left - offset.x) / zoom / chartWidth) * (data.length - 1));
    
    if (index >= 0 && index < data.length) {
      const candle = data[index];
      setTooltip({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        price: currentPrice,
        x: x,
        y: y
      });
    } else {
      setTooltip(null);
    }

    if (isDragging) {
      setOffset(prev => ({
        x: prev.x + (x - dragStart.x),
        y: prev.y + (y - dragStart.y)
      }));
      setDragStart({ x, y });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
  };

  // Buy/Sell handlers
  const handleBuy = async () => {
    if (!userAddress) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const amount = prompt('Enter amount in USD:', '100');
      if (!amount) return;

      const amountWei = toDecimals(parseFloat(amount), 18);

      const quote = await getSwapQuote(
        chainId,
        'USDC',
        symbol,
        amountWei,
        userAddress,
        0.3
      );

      console.log("QUOTE:", quote);

      const txData = quote?.txData || quote;

      if (!txData?.to || !txData?.data) {
        throw new Error('Invalid txData');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: txData.to,
        data: txData.data,
        value: txData.value || '0'
      });

      console.log("TX SENT:", tx);

      await tx.wait();

      alert("Swap completed!");

    } catch (error) {
      console.error('Swap error:', error);
      alert('Swap failed: ' + (error as Error).message);
    }
  };

  const handleSell = async () => {
    alert('Sell functionality coming soon!');
  };

  // Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    drawChart();
  }, [drawChart]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="relative w-full h-full bg-black dark:bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">{symbol}</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">
                ${currentPrice.toFixed(2)}
              </span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                priceChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {priceChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span className="text-sm font-medium">
                  {Math.abs(priceChange).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Time Range */}
            <div className="flex bg-gray-900 rounded-lg p-1">
              {(['1D', '1S', '1M', '3M', '1Y'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    timeRange === range 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* SMA Toggles */}
            <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-400">SMA:</span>
              {[
                { key: 'sma7', label: '7', color: 'text-orange-500' },
                { key: 'sma25', label: '25', color: 'text-blue-500' },
                { key: 'sma99', label: '99', color: 'text-pink-500' }
              ].map(sma => (
                <button
                  key={sma.key}
                  onClick={() => setShowSMA(prev => ({ ...prev, [sma.key]: !prev[sma.key as keyof typeof prev] }))}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    showSMA[sma.key as keyof typeof showSMA]
                      ? sma.color + ' bg-gray-800'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {sma.label}
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-gray-900 rounded-lg">
              <button
                onClick={() => setZoom(prev => Math.max(0.5, prev * 0.9))}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={() => setZoom(prev => Math.min(5, prev * 1.1))}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Buy/Sell */}
            <div className="flex gap-2">
              <button
                onClick={handleBuy}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Buy
              </button>
              <button
                onClick={handleSell}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-full pt-16">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="text-white">Loading chart data...</div>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        />

        {/* Tooltip */}
        {tooltip && (
          <div 
            className="absolute bg-gray-900 border border-gray-700 rounded-lg p-3 text-white text-xs z-30"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`
            }}
          >
            <div className="space-y-1">
              <div className="font-bold">{new Date(tooltip.time).toLocaleString()}</div>
              <div>O: {tooltip.open.toFixed(4)}</div>
              <div>H: {tooltip.high.toFixed(4)}</div>
              <div>L: {tooltip.low.toFixed(4)}</div>
              <div>C: {tooltip.close.toFixed(4)}</div>
              <div>Vol: {tooltip.volume.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
