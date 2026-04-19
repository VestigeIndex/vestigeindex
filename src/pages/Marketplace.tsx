import React, { Suspense, lazy, useMemo, useState } from "react";
import { ArrowUpRight, Loader2, Search, TrendingDown, TrendingUp } from "lucide-react";
import { usePrices } from "../hooks/usePrices";
import { formatCurrency, formatNumber, formatPercent } from "../lib/utils";
import SwapModal from "../components/SwapModal";

const ProChartGL = lazy(() => import("../components/ProChartGL").then((module) => ({ default: module.ProChartGL })));

interface SwapTarget {
  name: string;
  symbol: string;
  price: number;
  image?: string;
}

type FilterKey = "all" | "gainers" | "losers";

export default function Marketplace() {
  const { coins, loading, error, refetch } = usePrices();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [swapTarget, setSwapTarget] = useState<SwapTarget | null>(null);
  const [swapMode, setSwapMode] = useState<"buy" | "sell">("buy");
  const [chartTarget, setChartTarget] = useState<SwapTarget | null>(null);

  const filteredCoins = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return coins
      .filter((coin) => {
        if (!normalizedSearch) return true;
        return (
          coin.name.toLowerCase().includes(normalizedSearch) ||
          coin.symbol.toLowerCase().includes(normalizedSearch)
        );
      })
      .filter((coin) => {
        if (filter === "gainers") return coin.price_change_percentage_24h >= 0;
        if (filter === "losers") return coin.price_change_percentage_24h < 0;
        return true;
      })
      .slice(0, 100);
  }, [coins, filter, search]);

  const heroStats = useMemo(() => {
    const top = filteredCoins[0];
    const gainers = filteredCoins.filter((coin) => coin.price_change_percentage_24h >= 0).length;
    const losers = filteredCoins.filter((coin) => coin.price_change_percentage_24h < 0).length;
    const totalVolume = filteredCoins.reduce((sum, coin) => sum + coin.total_volume, 0);

    return {
      benchmark: top ? `${top.symbol} ${formatPercent(top.price_change_percentage_24h)}` : "Awaiting feed",
      gainers,
      losers,
      totalVolume,
    };
  }, [filteredCoins]);

  function openSwap(coin: SwapTarget, mode: "buy" | "sell") {
    setSwapTarget(coin);
    setSwapMode(mode);
  }

  return (
    <div className="space-y-6">
      <section className="institutional-card fade-up overflow-hidden p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Institutional market console</div>
            <h2 className="mt-3 font-display text-4xl tracking-[0.1em] text-foreground">
              Premium execution across live crypto markets
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              Real-time market depth, live wallet connectivity and execution-ready asset discovery with resilient data routing.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Benchmark</div>
              <div className="mt-2 text-lg font-semibold text-foreground">{heroStats.benchmark}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Breadth</div>
              <div className="mt-2 text-lg font-semibold text-foreground">
                {heroStats.gainers} up / {heroStats.losers} down
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">24h volume</div>
              <div className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(heroStats.totalVolume)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="institutional-card fade-up p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search assets, symbols or sectors"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-white/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["all", "gainers", "losers"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`institutional-button ${filter === item ? "institutional-glow bg-white/[0.08]" : ""}`}
              >
                {item === "all" ? "All assets" : item === "gainers" ? "Positive momentum" : "Negative momentum"}
              </button>
            ))}
            <button onClick={() => void refetch()} className="institutional-button">
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="institutional-card fade-up overflow-hidden">
        {loading ? (
          <div className="flex min-h-[30rem] items-center justify-center">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading institutional market feed...</span>
          </div>
        ) : error ? (
          <div className="flex min-h-[20rem] flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="max-w-md text-sm text-muted-foreground">
              We could not refresh live market data right now. Cached pricing remains available when possible.
            </p>
            <button onClick={() => void refetch()} className="institutional-button">
              Try again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border/80 bg-white/[0.03] text-left">
                <tr className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">24h</th>
                  <th className="px-6 py-4">Volume</th>
                  <th className="px-6 py-4">Market cap</th>
                  <th className="px-6 py-4 text-right">Execution</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoins.map((coin, index) => {
                  const isUp = coin.price_change_percentage_24h >= 0;
                  const swapTargetData = {
                    name: coin.name,
                    symbol: coin.symbol,
                    price: coin.current_price,
                    image: coin.image,
                  };

                  return (
                    <tr
                      key={`${coin.symbol}-${index}`}
                      className="border-b border-white/6 transition-colors hover:bg-white/[0.035]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="h-10 w-10 rounded-full border border-white/10 bg-black/30"
                          />
                          <div>
                            <div className="font-medium text-foreground">{coin.name}</div>
                            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {coin.symbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {formatCurrency(coin.current_price, coin.current_price < 1 ? 4 : 2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${isUp ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                          {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {formatPercent(coin.price_change_percentage_24h)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatCurrency(coin.total_volume)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatCurrency(coin.market_cap)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setChartTarget(swapTargetData)} className="institutional-button">
                            Chart
                          </button>
                          <button onClick={() => openSwap(swapTargetData, "buy")} className="institutional-button">
                            Buy
                          </button>
                          <button onClick={() => openSwap(swapTargetData, "sell")} className="institutional-button">
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {filteredCoins.slice(0, 3).map((coin, index) => {
          const isUp = coin.price_change_percentage_24h >= 0;
          return (
            <article key={`${coin.symbol}-summary-${index}`} className="institutional-card fade-up p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display text-xl tracking-[0.08em] text-foreground">{coin.symbol}</div>
                  <div className="text-sm text-muted-foreground">{coin.name}</div>
                </div>
                <ArrowUpRight className={`h-5 w-5 ${isUp ? "text-emerald-300" : "text-red-300"}`} />
              </div>
              <div className="mt-6 text-3xl font-semibold text-foreground">
                {formatCurrency(coin.current_price, coin.current_price < 1 ? 4 : 2)}
              </div>
              <div className={`mt-3 text-sm ${isUp ? "text-emerald-300" : "text-red-300"}`}>
                {formatPercent(coin.price_change_percentage_24h)} in the last 24h
              </div>
              <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span>Volume {formatCurrency(coin.total_volume)}</span>
                <span>Mcap {formatNumber(coin.market_cap)}</span>
              </div>
            </article>
          );
        })}
      </section>

      {swapTarget && (
        <SwapModal coin={swapTarget} mode={swapMode} feeRate={0.003} onClose={() => setSwapTarget(null)} />
      )}

      {chartTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="institutional-card max-h-[92vh] w-full max-w-6xl overflow-hidden p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Live chart</div>
                <h3 className="mt-2 font-display text-2xl tracking-[0.08em] text-foreground">
                  {chartTarget.name} ({chartTarget.symbol})
                </h3>
              </div>
              <button onClick={() => setChartTarget(null)} className="institutional-button">
                Close
              </button>
            </div>

            <Suspense
              fallback={
                <div className="flex h-[34rem] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
                  <Loader2 className="mr-3 h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading advanced chart...</span>
                </div>
              }
            >
              <ProChartGL
                symbol={chartTarget.symbol}
                height={540}
                onBuy={() => openSwap(chartTarget, "buy")}
                onSell={() => openSwap(chartTarget, "sell")}
                onClose={() => setChartTarget(null)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
