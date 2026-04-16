import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { useIndexPrices } from "../hooks/usePrices";
import { formatCurrency, formatPercent, cn } from "../lib/utils";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import SwapModal from "../components/SwapModal";
import { INDEX_FEE } from "../lib/constants";

const INDICES = [
  {
    symbol: "DPI",
    name: "DeFi Pulse Index",
    description: "Indice ponderado de los principales tokens DeFi",
    category: "DeFi",
  },
  {
    symbol: "MVI",
    name: "Metaverse Index",
    description: "Exposicion diversificada al ecosistema metaverso",
    category: "Metaverse",
  },
  {
    symbol: "DATA",
    name: "Data Economy Index",
    description: "Tokens de economia de datos y oracles",
    category: "Data",
  },
  {
    symbol: "PAXG",
    name: "PAX Gold",
    description: "Token respaldado por oro fisico certificado",
    category: "Commodity",
  },
  {
    symbol: "XAUt",
    name: "Tether Gold",
    description: "Token de oro digital de Tether",
    category: "Commodity",
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    description: "Red de oracles descentralizados lideres",
    category: "Infrastructure",
  },
  {
    symbol: "1INCH",
    name: "1inch Network",
    description: "Agregador de DEX multi-cadena",
    category: "DeFi",
  },
  {
    symbol: "OIL",
    name: "Crude Oil Index",
    description: "Exposicion tokenizada al precio del petroleo crudo",
    category: "Commodity",
  },
];

interface SwapTarget {
  name: string;
  symbol: string;
  price: number;
}

export default function Indices() {
  const { lang } = useApp();
  const prices = useIndexPrices();
  const [swapTarget, setSwapTarget] = useState<SwapTarget | null>(null);
  const [swapMode, setSwapMode] = useState<"buy" | "sell">("buy");

  function openSwap(item: { name: string; symbol: string }, mode: "buy" | "sell") {
    const priceData = prices[item.symbol];
    setSwapTarget({ name: item.name, symbol: item.symbol, price: priceData?.price ?? 0 });
    setSwapMode(mode);
  }

  const categoryColors: Record<string, string> = {
    DeFi: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    Metaverse: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Data: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
    Commodity: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    Infrastructure: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-bold tracking-tight">{t(lang, "indices_title")}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t(lang, "fee_label")}</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {INDICES.map((item) => {
            const priceData = prices[item.symbol];
            const price = priceData?.price ?? 0;
            const change = priceData?.change ?? 0;
            const isUp = change >= 0;
            const loaded = Object.keys(prices).length > 0;

            return (
              <div
                key={item.symbol}
                className="bg-card border border-card-border rounded-lg p-4 flex flex-col gap-3 hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{item.symbol}</span>
                      <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", categoryColors[item.category] ?? "bg-muted text-muted-foreground")}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{item.name}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>

                <div className="flex items-end justify-between">
                  <div>
                    {!loaded ? (
                      <Loader2 size={14} className="animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <p className="font-mono font-semibold text-sm">
                          {price > 0 ? formatCurrency(price) : "—"}
                        </p>
                        <p className={cn("text-xs font-medium flex items-center gap-0.5 mt-0.5", isUp ? "text-emerald-500" : "text-red-500")}>
                          {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {formatPercent(change)}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-1.5 mt-auto pt-1">
                  <button
                    onClick={() => openSwap(item, "buy")}
                    className="flex-1 py-1.5 bg-emerald-600 text-white text-xs rounded font-medium hover:bg-emerald-700 transition-colors"
                  >
                    {t(lang, "buy")}
                  </button>
                  <button
                    onClick={() => openSwap(item, "sell")}
                    className="flex-1 py-1.5 bg-red-500 text-white text-xs rounded font-medium hover:bg-red-600 transition-colors"
                  >
                    {t(lang, "sell")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {swapTarget && (
        <SwapModal
          coin={swapTarget}
          mode={swapMode}
          feeRate={INDEX_FEE}
          onClose={() => setSwapTarget(null)}
        />
      )}
    </div>
  );
}
