// RSI Indicator Panel

import React from 'react';

interface RSIPanelProps {
  height?: number;
}

export function RSIPanel({ height = 100 }: RSIPanelProps) {
  // This would be rendered in canvas in the full implementation
  // Placeholder for future implementation
  return (
    <div 
      className="bg-[#0d1117] border-t border-[#30363d]"
      style={{ height }}
    >
      <div className="px-2 py-1 text-xs text-gray-500">RSI (14)</div>
    </div>
  );
}