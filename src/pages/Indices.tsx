import React, { useMemo, useState } from "react";
import { ArrowUpRight, ChevronRight, Loader2 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAllIndicesHistory } from "../hooks/useIndexHistory";
import { useIndexPrices } from "../hooks/usePrices";
import { formatCurrency, formatPercent } from "../lib/utils";

interface IndexCard {
  symbol: string;
  name: string;
  description: string;
  coinGeckoId: string;
  sector: string;
  components: string[];
}

const INDEX_CARDS: IndexCard[] = [
  {
    symbol: "DPI",
    name: "DeFi Pulse Index",
    description: "Blue-chip DeFi exposure with a benchmark-style basket of liquid on-chain protocols.",
    coinGeckoId: "defipulse-index",
    sector: "Decentralized Finance",
    components: ["UNI", "AAVE", "MKR", "SNX", "COMP"],
  },
  {
    symbol: "MVI",
    name: "Metaverse Index",
    description: "Access to gaming and immersive internet assets through a single structured vehicle.",
    coinGeckoId: "metaverse-index",
    sector: "Metaverse",
    components: ["MANA", "SAND", "AXS", "GALA", "ENJ"],
  },
  {
    symbol: "PAXG",
    name: "PAX Gold",
    description: "Institutional-grade gold exposure with tokenized settlement and digital transferability.",
    coinGeckoId: "pax-gold",
    sector: "Tokenized Commodities",
    components: ["Allocated physical gold"],
  },
  {
    symbol: "XAUt",
    name: "Tether Gold",
    description: "Gold-backed asset for investors seeking inflation-aware reserve diversification.",
    coinGeckoId: "tether-gold",
    sector: "Tokenized Commodities",
    components: ["Allocated physical gold"],
  },
];

export default function Indices() {
  const prices = useIndexPrices();
  const [selectedIndex, setSelectedIndex] = useState<IndexCard>(INDEX_CARDS[0]);
  const { histories, loading } = useAllIndicesHistory(
    Object.fromEntries(INDEX_CARDS.map((item) => [item.symbol, item.coinGeckoId])),
    30,
  );

  const selectedSeries = useMemo(() => {
    const rawSeries = histories[selectedIndex.symbol]?.prices ?? [];
    return rawSeries.map(([timestamp, value]) => ({
      date: new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value,
    }));
  }, [histories, selectedIndex.symbol]);

  return (
    <div className="space-y-6">
      <section className="institutional-card fade-up p-6 md:p-8">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Tokenized index suite</div>
          <h2 className="mt-3 font-display text-4xl tracking-[0.1em] text-foreground">
            Structured exposure for professional crypto portfolios
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Benchmarks, sector baskets and tokenized real-world references presented through a premium institutional dashboard.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="institutional-card fade-up p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">30-day performance</div>
              <h3 className="mt-2 font-display text-2xl tracking-[0.08em] text-foreground">{selectedIndex.name}</h3>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Spot</div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {formatCurrency(prices[selectedIndex.symbol]?.price ?? 0)}
              </div>
              <div
                className={`mt-1 text-sm ${
                  (prices[selectedIndex.symbol]?.change ?? 0) >= 0 ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {formatPercent(prices[selectedIndex.symbol]?.change ?? 0)}
              </div>
            </div>
          </div>

          <div className="h-[24rem] rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Loading index history...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedSeries}>
                  <defs>
                    <linearGradient id="vestige-index-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#7dd3fc" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "#8b8b8b", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fill: "#8b8b8b", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${Math.round(value)}`}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "18px",
                      background: "rgba(5, 5, 5, 0.94)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  />
                  <Area
                    dataKey="value"
                    stroke="#7dd3fc"
                    strokeWidth={2.5}
                    fill="url(#vestige-index-fill)"
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {INDEX_CARDS.map((item) => {
            const itemPrice = prices[item.symbol];
            const isActive = selectedIndex.symbol === item.symbol;
            const isUp = (itemPrice?.change ?? 0) >= 0;

            return (
              <button
                key={item.symbol}
                onClick={() => setSelectedIndex(item)}
                className={`institutional-card fade-up w-full p-5 text-left transition-all ${
                  isActive ? "institutional-glow" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{item.sector}</div>
                    <h3 className="mt-2 font-display text-xl tracking-[0.08em] text-foreground">{item.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                  <ArrowUpRight className={`h-5 w-5 ${isUp ? "text-emerald-300" : "text-red-300"}`} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.components.map((component) => (
                    <span
                      key={component}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      {component}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Reference price</div>
                    <div className="mt-2 text-xl font-semibold text-foreground">
                      {formatCurrency(itemPrice?.price ?? 0)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={isUp ? "text-emerald-300" : "text-red-300"}>
                      {formatPercent(itemPrice?.change ?? 0)}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
