// MACD Indicator Panel

import React from 'react';

interface MACDPanelProps {
  height?: number;
}

export function MACDPanel({ height = 100 }: MACDPanelProps) {
  // This would be rendered in canvas in the full implementation
  // Placeholder for future implementation
  return (
    <div 
      className="bg-[#0d1117] border-t border-[#30363d]"
      style={{ height }}
    >
      <div className="px-2 py-1 text-xs text-gray-500">MACD (12, 26, 9)</div>
    </div>
  );
}