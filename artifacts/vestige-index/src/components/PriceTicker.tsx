import React from "react";
import { useTicker } from "../hooks/usePrices";
import { formatPercent } from "../lib/utils";

export default function PriceTicker() {
  const items = useTicker();

  if (!items.length) {
    return (
      <div className="h-8 bg-card border-b border-border flex items-center px-4">
        <span className="text-xs text-muted-foreground">Cargando precios...</span>
      </div>
    );
  }

  const doubled = [...items, ...items];

  return (
    <div className="h-8 bg-card border-b border-border overflow-hidden flex items-center">
      <div className="flex ticker-track whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={`${item.symbol}-${i}`} className="inline-flex items-center gap-1.5 px-4 text-xs border-r border-border/40 h-8">
            <span className="font-semibold text-foreground">{item.symbol}</span>
            <span className="text-muted-foreground">
              ${item.price < 1 ? item.price.toFixed(4) : item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={item.isUp ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}>
              {formatPercent(item.change)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
