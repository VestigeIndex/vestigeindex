import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { useIndexPrices } from "../hooks/usePrices";
import { useIndexHistory } from "../hooks/useIndexHistory";
import { formatCurrency, formatPercent, cn } from "../lib/utils";
import { TrendingUp, TrendingDown, Loader2, ChevronDown, ChevronRight, ExternalLink, Info } from "lucide-react";
import SwapModal from "../components/SwapModal";
import PriceChart from "../components/PriceChart";
import { TOKENIZED_INDICES, CATEGORIES, categoryColors, type TokenizedIndex } from "../config/indices";
import { INDEX_FEE } from "../lib/constants";

interface SwapTarget {
  name: string;
  symbol: string;
  price: number;
  image?: string;
}

// Index Card Component with expandable chart
function IndexCard({ 
  index, 
  price, 
  change, 
  onBuy, 
  onSell 
}: { 
  index: TokenizedIndex; 
  price: number; 
  change: number;
  onBuy: () => void;
  onSell: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: historyData, loading: historyLoading } = useIndexHistory(index.coinGeckoId, 30);
  
  const colors = categoryColors[index.category] || { bg: "bg-muted", text: "text-muted-foreground" };
  const isUp = change >= 0;
  const sparklineData = historyData?.prices?.slice(-30).map(p => p[1]) || [];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-border transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{index.symbol}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors.bg} ${colors.text}`}>
                {index.category}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{index.name}</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-semibold text-sm">
              {price > 0 ? formatCurrency(price) : "—"}
            </p>
            <p className={cn("text-xs font-medium flex items-center gap-0.5 mt-0.5", isUp ? "text-emerald-500" : "text-red-500")}>
              {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {formatPercent(change)}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{index.description}</p>

        {sparklineData.length > 0 && (
          <div className="h-8 mb-3">
            <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none">
              <path 
                d={sparklineData.map((v, i) => {
                  const x = (i / (sparklineData.length - 1)) * 100;
                  const y = 32 - ((v - Math.min(...sparklineData)) / (Math.max(...sparklineData) - Math.min(...sparklineData) || 1)) * 28;
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                }).join(" ")}
                stroke={isUp ? "#10b981" : "#ef4444"}
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {expanded ? "Ocultar gráfico" : "Ver gráfico"}
          </button>
          <a 
            href={`https://etherscan.io/token/${index.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink size={11} />
            <span className="hidden sm:inline">Etherscan</span>
          </a>
        </div>

        <div className="flex gap-1.5 mt-auto">
          <button
            onClick={onBuy}
            className="flex-1 py-1.5 bg-emerald-600 text-white text-xs rounded font-medium hover:bg-emerald-700 transition-colors"
          >
            Comprar
          </button>
          <button
            onClick={onSell}
            className="flex-1 py-1.5 bg-red-500 text-white text-xs rounded font-medium hover:bg-red-600 transition-colors"
          >
            Vender
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium">Historial de precios (30 días)</span>
            <span className="text-xs text-muted-foreground">
              Comisión: {index.commission}%
            </span>
          </div>
          
          {historyLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : historyData?.prices ? (
            <div className="flex justify-center">
              <PriceChart data={historyData.prices} width={300} height={140} showAxis={true} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
              No hay datos disponibles
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info size={12} />
              <span>Contrato:</span>
              <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{index.address.slice(0, 6)}...{index.address.slice(-4)}</code>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Correlación:</span>
            <span className="text-xs font-medium bg-primary/10 px-2 py-0.5 rounded">
              {index.correlation}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Indices() {
  const { lang } = useApp();
  const prices = useIndexPrices();
  const [swapTarget, setSwapTarget] = useState<SwapTarget | null>(null);
  const [swapMode, setSwapMode] = useState<"buy" | "sell">("buy");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredIndices = useMemo(() => {
    if (!selectedCategory) return TOKENIZED_INDICES;
    return TOKENIZED_INDICES.filter(idx => idx.category === selectedCategory);
  }, [selectedCategory]);

  function openSwap(item: TokenizedIndex, mode: "buy" | "sell") {
    const priceData = prices[item.symbol];
    setSwapTarget({ 
      name: item.name, 
      symbol: item.symbol, 
      price: priceData?.price ?? 0,
    });
    setSwapMode(mode);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-bold tracking-tight">{t(lang, "indices_title")}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t(lang, "fee_label")}</p>
      </div>

      <div className="px-6 py-3 border-b border-border flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-3 py-1 text-xs rounded-full transition-colors",
            !selectedCategory 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Todos
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            className={cn(
              "px-3 py-1 text-xs rounded-full transition-colors",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredIndices.map((item) => {
            const priceData = prices[item.symbol];
            const price = priceData?.price ?? 0;
            const change = priceData?.change ?? 0;

            return (
              <IndexCard
                key={item.symbol}
                index={item}
                price={price}
                change={change}
                onBuy={() => openSwap(item, "buy")}
                onSell={() => openSwap(item, "sell")}
              />
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