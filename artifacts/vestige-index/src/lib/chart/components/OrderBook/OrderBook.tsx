// OrderBook Component - displays bids and asks

import React from 'react';
import { useChartStore, type OrderBookEntry } from '../../store/chartStore';
import { formatCurrency, formatNumber } from '../../utils/format';

function OrderBookRow({ entry, type, maxQuantity }: { 
  entry: OrderBookEntry; 
  type: 'bid' | 'ask';
  maxQuantity: number;
}) {
  const percentage = (entry.quantity / maxQuantity) * 100;
  const color = type === 'bid' ? 'bg-emerald-500/20' : 'bg-red-500/20';
  const barColor = type === 'bid' ? 'bg-emerald-500' : 'bg-red-500';
  
  return (
    <div className="relative flex items-center text-xs py-0.5">
      <div 
        className={`absolute inset-y-0 right-0 ${color}`}
        style={{ width: `${percentage}%` }}
      />
      <div className={`relative flex justify-between w-full px-2 ${type === 'bid' ? 'text-emerald-400' : 'text-red-400'}`}>
        <span>{formatCurrency(entry.price)}</span>
        <span className="text-gray-400">{formatNumber(entry.quantity, 4)}</span>
      </div>
    </div>
  );
}

export function OrderBook() {
  const bids = useChartStore((state) => state.bids);
  const asks = useChartStore((state) => state.asks);
  const candles = useChartStore((state) => state.candles);
  
  const currentPrice = candles.length > 0 ? candles[candles.length - 1].close : 0;
  
  // Get max quantity for bar visualization
  const allQuantities = [...bids, ...asks].map(e => e.quantity);
  const maxQuantity = Math.max(...allQuantities, 0.01);

  // Calculate spread
  const bestBid = bids.length > 0 ? bids[0].price : 0;
  const bestAsk = asks.length > 0 ? asks[0].price : 0;
  const spread = bestAsk - bestBid;
  const spreadPercent = currentPrice > 0 ? (spread / currentPrice) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-lg border border-[#30363d]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#30363d]">
        <h3 className="text-sm font-semibold text-white">Order Book</h3>
      </div>
      
      {/* Column headers */}
      <div className="flex px-2 py-1 text-xs text-gray-500 border-b border-[#21262d]">
        <span className="flex-1">Precio</span>
        <span>Cantidad</span>
      </div>
      
      {/* Asks (reversed - lowest first) */}
      <div className="flex-1 overflow-hidden flex flex-col-reverse">
        {asks.slice(0, 15).map((ask, i) => (
          <OrderBookRow 
            key={`ask-${i}`} 
            entry={ask} 
            type="ask" 
            maxQuantity={maxQuantity}
          />
        ))}
      </div>
      
      {/* Spread indicator */}
      <div className="px-2 py-2 bg-[#161b22] border-y border-[#30363d]">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Spread</span>
          <span className="text-white">
            {formatCurrency(spread)} ({spreadPercent.toFixed(3)}%)
          </span>
        </div>
        {currentPrice > 0 && (
          <div className="text-center text-lg font-bold text-white mt-1">
            {formatCurrency(currentPrice)}
          </div>
        )}
      </div>
      
      {/* Bids */}
      <div className="flex-1 overflow-hidden">
        {bids.slice(0, 15).map((bid, i) => (
          <OrderBookRow 
            key={`bid-${i}`} 
            entry={bid} 
            type="bid" 
            maxQuantity={maxQuantity}
          />
        ))}
      </div>
    </div>
  );
}
