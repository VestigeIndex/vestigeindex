import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { formatCurrency, cn } from "../lib/utils";
import { Search, TrendingUp, TrendingDown, Loader2, X } from "lucide-react";
import SwapModal from "../components/SwapModal";
import { CandlestickChart } from "../components/CandlestickChart";

interface Crypto {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  volume: number;
  logo: string;
}

interface SwapTarget {
  name: string;
  symbol: string;
  price: number;
  image?: string;
}

export default function Marketplace() {
  const { lang, wallet } = useApp();
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [swapTarget, setSwapTarget] = useState<SwapTarget | null>(null);
  const [swapMode, setSwapMode] = useState<"buy" | "sell">("buy");
  const [chartCoin, setChartCoin] = useState<Crypto | null>(null);

  // Calcular cambio en 7 días desde Binance
  const calculateChange7d = useCallback(async (symbol: string): Promise<number> => {
    try {
      const now = Date.now();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1d&startTime=${weekAgo}&limit=7`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length >= 2) {
        const oldPrice = parseFloat(data[0][4]);
        const currentPrice = parseFloat(data[data.length - 1][4]);
        return ((currentPrice - oldPrice) / oldPrice) * 100;
      }
    } catch (e) {
      console.error("Error calculating 7d change:", e);
    }
    return 0;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener todos los tickers de Binance
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const allData = await response.json();
        
        // 2. Filtrar solo pares USDT y ordenar por volumen
        const usdtPairs = allData
          .filter((item: any) => item.symbol.endsWith('USDT') && !item.symbol.includes('UP') && !item.symbol.includes('DOWN'))
          .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
          .slice(0, 100);
        
        // 3. Obtener logos desde CoinGecko (solo para logos)
        const geckoResponse = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=250');
        const geckoData = await geckoResponse.json();
        const logoMap = new Map();
        geckoData.forEach((coin: any) => {
          logoMap.set(coin.symbol.toUpperCase(), { logo: coin.image, name: coin.name });
        });
        
        // 4. Obtener cambio 7d para los primeros 30 (para no sobrecargar API)
        const symbols7d = usdtPairs.slice(0, 30).map((item: any) => item.symbol.replace('USDT', ''));
        const change7dMap: Record<string, number> = {};
        
        // Fetch en paralelo
        const promises = symbols7d.map(async (symbol: string) => {
          const change7d = await calculateChange7d(symbol);
          return { symbol, change7d };
        });
        
        const results = await Promise.all(promises);
        results.forEach(({ symbol, change7d }) => {
          change7dMap[symbol] = change7d;
        });

        // 5. Mapear datos
        const cryptosData = usdtPairs.map((item: any, index: number) => {
          const symbol = item.symbol.replace('USDT', '');
          const geckoInfo = logoMap.get(symbol) || {};
          return {
            symbol,
            name: geckoInfo.name || symbol,
            price: parseFloat(item.lastPrice),
            change24h: parseFloat(item.priceChangePercent),
            change7d: change7dMap[symbol] || 0,
            volume: parseFloat(item.quoteVolume),
            logo: geckoInfo.logo || '',
          };
        });
        
        setCryptos(cryptosData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [calculateChange7d]);

  const filtered = cryptos.filter(
    (c) =>
      c.symbol.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  function openSwap(coin: Crypto, mode: "buy" | "sell") {
    if (!wallet.connected) {
      alert("⚠️ Por favor conecta tu wallet primero.\n\nHaz clic en 'Conectar Wallet' en la barra superior.");
      return;
    }
    setSwapTarget({
      name: coin.name,
      symbol: coin.symbol,
      price: coin.price,
      image: coin.logo,
    });
    setSwapMode(mode);
  }

  function openChart(coin: Crypto) {
    setChartCoin(coin);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-bold tracking-tight">{t(lang, "marketplace")}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t(lang, "top1000")} — {t(lang, "fee_label_top")}</p>
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
        {!loading && (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-card border-b border-border z-10">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{t(lang, "asset")}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">{t(lang, "price")}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">{t(lang, "change_24h")}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">{t(lang, "change_7d")}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">{t(lang, "volume")}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground w-28"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coin, index) => {
                const isUp24 = coin.change24h >= 0;
                const isUp7 = coin.change7d >= 0;
                return (
                  <tr 
                    key={coin.symbol} 
                    onDoubleClick={() => openChart(coin)}
                    className="table-row-hover border-b border-border/40 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground text-xs">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {coin.logo ? (
                          <img src={coin.logo} alt={coin.name} className="w-6 h-6 rounded-full shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                            {coin.symbol.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-xs leading-none">{coin.name}</div>
                          <div className="text-xs text-muted-foreground uppercase mt-0.5">{coin.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      {coin.price < 0.01
                        ? `$${coin.price.toFixed(6)}`
                        : formatCurrency(coin.price)}
                    </td>
                    <td className={cn("px-4 py-3 text-right text-xs font-medium", isUp24 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                      <span className="flex items-center justify-end gap-1">
                        {isUp24 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {coin.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className={cn("px-4 py-3 text-right text-xs font-medium", isUp7 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                      {coin.change7d.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden md:table-cell">
                      ${(coin.volume / 1e6).toFixed(0)}M
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); openSwap(coin, "buy"); }}
                          className="px-2.5 py-1 bg-emerald-600 text-white text-xs rounded font-medium hover:bg-emerald-700 transition-colors"
                        >
                          {t(lang, "buy")}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openSwap(coin, "sell"); }}
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
      </div>

      {/* Swap Modal */}
      {swapTarget && (
        <SwapModal
          coin={swapTarget}
          mode={swapMode}
          feeRate={0.003}
          onClose={() => setSwapTarget(null)}
        />
      )}

      {/* Chart Modal */}
      {chartCoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setChartCoin(null)}>
          <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden m-4 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                {chartCoin.logo && <img src={chartCoin.logo} alt={chartCoin.name} className="w-8 h-8 rounded-full" />}
                <div>
                  <h2 className="text-lg font-bold">{chartCoin.name}</h2>
                  <p className="text-xs text-muted-foreground">{chartCoin.symbol}/USDT</p>
                </div>
              </div>
              <button onClick={() => setChartCoin(null)} className="p-2 hover:bg-muted rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <CandlestickChart 
                symbol={chartCoin.symbol} 
                onBuy={() => openSwap(chartCoin, "buy")}
                onSell={() => openSwap(chartCoin, "sell")}
                onClose={() => setChartCoin(null)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}