// Main Chart Component - integrates ChartEngine with React

import React, { useEffect, useRef, useState } from 'react';
import { useChartStore, type Candle } from '../../store/chartStore';
import { useCandles } from '../../hooks/useCandles';
import { useWebSocket } from '../../hooks/useWebSocket';
import { ChartEngine, createChartEngine } from '../../core/ChartEngine';
import { formatCurrency, formatPercent } from '../../utils/format';
import { formatDateTime } from '../../utils/math';

interface MainChartProps {
  symbol?: string;
  height?: number;
}

export function MainChart({ symbol = 'BTCUSDT', height = 500 }: MainChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ChartEngine | null>(null);
  
  const [dimensions, setDimensions] = useState({ width: 800, height });
  
  const candles = useChartStore((state) => state.candles);
  const isLoading = useChartStore((state) => state.isLoading);
  const crosshairX = useChartStore((state) => state.crosshairX);
  const crosshairY = useChartStore((state) => state.crosshairY);
  const setCrosshair = useChartStore((state) => state.setCrosshair);
  
  // Load historical data
  useCandles(symbol);
  
  // Connect to real-time WebSocket
  useWebSocket(symbol);

  // Initialize chart engine
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const engine = createChartEngine({
      container: containerRef.current,
      canvas: canvasRef.current,
    });
    
    engineRef.current = engine;
    
    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.floor(width), height: Math.floor(height) });
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
      engine.destroy();
    };
  }, []);

  // Update candles in engine
  useEffect(() => {
    if (engineRef.current && candles.length > 0) {
      engineRef.current.setCandles(candles);
    }
  }, [candles]);

  // Handle mouse events for crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCrosshair(x, y);
  };

  const handleMouseLeave = () => {
    setCrosshair(null, null);
  };

  // Get candle at crosshair position
  const getCrosshairCandle = (): Candle | null => {
    if (crosshairX === null || candles.length === 0) return null;
    const index = Math.floor((crosshairX - 50) / 10);
    return candles[index] || null;
  };

  const crosshairCandle = getCrosshairCandle();

  return (
    <div 
      ref={containerRef}
      className="relative bg-[#0d1117] rounded-lg overflow-hidden"
      style={{ height }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/80 z-10">
          <div className="flex items-center gap-2 text-gray-400">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Cargando datos...</span>
          </div>
        </div>
      )}

      {/* Chart canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />

      {/* Crosshair info overlay */}
      {crosshairCandle && (
        <div className="absolute top-2 left-2 bg-[#161b22]/90 px-3 py-2 rounded text-xs font-mono text-gray-300 border border-[#30363d]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-gray-500">Tiempo:</span>
            <span>{formatDateTime(crosshairCandle.time)}</span>
            <span className="text-gray-500">Apertura:</span>
            <span className={crosshairCandle.close >= crosshairCandle.open ? 'text-emerald-400' : 'text-red-400'}>
              {formatCurrency(crosshairCandle.open)}
            </span>
            <span className="text-gray-500">Alto:</span>
            <span className="text-emerald-400">{formatCurrency(crosshairCandle.high)}</span>
            <span className="text-gray-500">Bajo:</span>
            <span className="text-red-400">{formatCurrency(crosshairCandle.low)}</span>
            <span className="text-gray-500">Cierre:</span>
            <span className={crosshairCandle.close >= crosshairCandle.open ? 'text-emerald-400' : 'text-red-400'}>
              {formatCurrency(crosshairCandle.close)}
            </span>
            <span className="text-gray-500">Cambio:</span>
            <span className={crosshairCandle.close >= crosshairCandle.open ? 'text-emerald-400' : 'text-red-400'}>
              {formatPercent(((crosshairCandle.close - crosshairCandle.open) / crosshairCandle.open) * 100)}
            </span>
          </div>
        </div>
      )}

      {/* Symbol info */}
      <div className="absolute top-2 right-2 text-right">
        <div className="text-lg font-bold text-white">{symbol.replace('USDT', '/USDT')}</div>
        {candles.length > 0 && (
          <div className={`text-sm ${candles[candles.length - 1].close >= candles[candles.length - 1].open ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(candles[candles.length - 1].close)}
          </div>
        )}
      </div>
    </div>
  );
}
