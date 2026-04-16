import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { usePrices } from "../hooks/usePrices";
import { formatCurrency, formatPercent, formatNumber, cn } from "../lib/utils";
import { Search, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import Sparkline from "../components/Sparkline";
import SwapModal from "../components/SwapModal";

interface SwapTarget {
  name: string;
  symbol: string;
  price: number;
  image?: string;
}

export default function Marketplace() {
  const { lang } = useApp();
  const { coins, loading, error } = usePrices(1, 100);
  const [search, setSearch] = useState("");
  const [swapTarget, setSwapTarget] = useState<SwapTarget | null>(null);
  const [swapMode, setSwapMode] = useState<"buy" | "sell">("buy");

  const filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  function openSwap(coin: SwapTarget, mode: "buy" | "sell") {
    setSwapTarget(coin);
    setSwapMode(mode);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-bold tracking-tight">{t(lang, "marketplace")}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t(lang, "top100")} — {t(lang, "fee_label_top")}</p>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2 max-w-sm">
          <div className="flex items-center flex-1 gap-2 bg-muted rounded px-3 py-1.5 border border-input">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(lang, "search")}
              className="bg-transparent text-sm outline-none flex-1 min-w-0"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-16 text-sm text-muted-foreground">{error}</div>
        )}
        {!loading && !error && (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-card border-b border-border z-10">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{t(lang, "asset")}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">{t(lang, "price")}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">{t(lang, "change_24h")}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">{t(lang, "change_7d")}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">{t(lang, "volume")}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground hidden xl:table-cell">{t(lang, "market_cap")}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">7d</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground w-36"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coin) => {
                const change24 = coin.price_change_percentage_24h ?? 0;
                const change7 = coin.price_change_percentage_7d_in_currency ?? 0;
                const sparkData = coin.sparkline_in_7d?.price ?? [];
                const isUp = change7 >= 0;

                return (
                  <tr key={coin.id} className="table-row-hover border-b border-border/40">
                    <td className="px-4 py-3 text-muted-foreground text-xs">{coin.market_cap_rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full shrink-0" />
                        <div>
                          <div className="font-medium text-xs leading-none">{coin.name}</div>
                          <div className="text-xs text-muted-foreground uppercase mt-0.5">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {coin.current_price < 0.01
                        ? `$${coin.current_price.toFixed(6)}`
                        : formatCurrency(coin.current_price)}
                    </td>
                    <td className={cn("px-4 py-3 text-right text-xs font-medium", change24 >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                      <span className="flex items-center justify-end gap-1">
                        {change24 >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {formatPercent(change24)}
                      </span>
                    </td>
                    <td className={cn("px-4 py-3 text-right text-xs font-medium hidden lg:table-cell", change7 >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                      {formatPercent(change7)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell">
                      {formatNumber(coin.total_volume)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden xl:table-cell">
                      {formatNumber(coin.market_cap)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex justify-end">
                        <Sparkline data={sparkData.slice(-30)} isUp={isUp} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => openSwap(coin, "buy")}
                          className="px-2.5 py-1 bg-emerald-600 text-white text-xs rounded font-medium hover:bg-emerald-700 transition-colors"
                        >
                          {t(lang, "buy")}
                        </button>
                        <button
                          onClick={() => openSwap(coin, "sell")}
                          className="px-2.5 py-1 bg-red-500 text-white text-xs rounded font-medium hover:bg-red-600 transition-colors"
                        >
                          {t(lang, "sell")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && search && (
          <div className="text-center py-16 text-sm text-muted-foreground">{t(lang, "no_results")}</div>
        )}
      </div>

      {swapTarget && (
        <SwapModal
          coin={swapTarget}
          mode={swapMode}
          feeRate={0.003}
          onClose={() => setSwapTarget(null)}
        />
      )}
    </div>
  );
}
