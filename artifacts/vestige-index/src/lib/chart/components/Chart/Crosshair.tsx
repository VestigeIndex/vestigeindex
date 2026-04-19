// Crosshair Component - displays crosshair overlay

import React from 'react';
import { useChartStore } from '../../store/chartStore';
import { formatCurrency, formatDateTime } from '../../utils/format';

export function Crosshair() {
  const crosshairX = useChartStore((state) => state.crosshairX);
  const crosshairY = useChartStore((state) => state.crosshairY);
  const candles = useChartStore((state) => state.candles);
  
  if (crosshairX === null || crosshairY === null) return null;
  
  // Find nearest candle
  const index = Math.floor((crosshairX - 50) / 10);
  const candle = candles[index];
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        background: 'linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.03) 1px, transparent 2px), linear-gradient(180deg, transparent 0px, rgba(255,255,255,0.03) 1px, transparent 2px)',
        backgroundSize: '10px 10px',
        backgroundPosition: `${crosshairX}px ${crosshairY}px`
      }}
    >
      {/* Vertical line */}
      <div 
        className="absolute top-0 bottom-0 w-px bg-gray-500/50"
        style={{ left: crosshairX }}
      />
      
      {/* Horizontal line */}
      <div 
        className="absolute left-0 right-0 h-px bg-gray-500/50"
        style={{ top: crosshairY }}
      />
      
      {/* Price label */}
      {candle && (
        <div 
          className="absolute right-0 bg-[#161b22] px-2 py-1 text-xs text-gray-300 border border-[#30363d]"
          style={{ top: crosshairY - 10 }}
        >
          {formatCurrency(candle.close)}
        </div>
      )}
      
      {/* Time label */}
      {candle && (
        <div 
          className="absolute bottom-0 bg-[#161b22] px-2 py-1 text-xs text-gray-300 border border-[#30363d]"
          style={{ left: crosshairX - 50 }}
        >
          {formatDateTime(candle.time)}
        </div>
      )}
    </div>
  );
}