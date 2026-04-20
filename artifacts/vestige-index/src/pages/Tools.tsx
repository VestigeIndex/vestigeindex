import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { Calculator, ArrowRightLeft } from "lucide-react";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", rate: 1 },
  { code: "EUR", name: "Euro", rate: 0.92 },
  { code: "GBP", name: "British Pound", rate: 0.79 },
  { code: "JPY", name: "Japanese Yen", rate: 151.2 },
  { code: "CNY", name: "Chinese Yuan", rate: 7.24 },
  { code: "BRL", name: "Brazilian Real", rate: 5.08 },
  { code: "MXN", name: "Mexican Peso", rate: 17.1 },
  { code: "ARS", name: "Argentine Peso", rate: 860 },
  { code: "BTC", name: "Bitcoin", rate: 1 / 62000 },
  { code: "ETH", name: "Ethereum", rate: 1 / 3200 },
];

export default function Tools() {
  const { lang } = useApp();

  const [principal, setPrincipal] = useState("1000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("5");
  const [compResult, setCompResult] = useState<number | null>(null);

  const [convAmount, setConvAmount] = useState("1");
  const [fromCurr, setFromCurr] = useState("USD");
  const [toCurr, setToCurr] = useState("EUR");
  const [convResult, setConvResult] = useState<number | null>(null);

  function calculate() {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const n = parseFloat(years);
    if (isNaN(P) || isNaN(r) || isNaN(n)) return;
    const result = P * Math.pow(1 + r, n);
    setCompResult(result);
  }

  function convert() {
    const amount = parseFloat(convAmount);
    if (isNaN(amount)) return;
    const from = CURRENCIES.find((c) => c.code === fromCurr);
    const to = CURRENCIES.find((c) => c.code === toCurr);
    if (!from || !to) return;
    const inUsd = amount / from.rate;
    const result = inUsd * to.rate;
    setConvResult(result);
  }

  function swap() {
    const tmp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(tmp);
    setConvResult(null);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="text-lg font-bold tracking-tight">{t(lang, "tools")}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Herramientas financieras</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          {/* Compound interest calculator */}
          <div className="bg-card border border-card-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-primary/10 rounded">
                <Calculator size={16} className="text-primary" />
              </div>
              <h2 className="text-sm font-semibold">{t(lang, "compound_calculator")}</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">{t(lang, "initial_amount")}</label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => { setPrincipal(e.target.value); setCompResult(null); }}
                  className="w-full bg-background border border-input rounded px-3 py-2 text-sm outline-none focus:border-ring transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">{t(lang, "annual_rate")}</label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => { setRate(e.target.value); setCompResult(null); }}
                  className="w-full bg-background border border-input rounded px-3 py-2 text-sm outline-none focus:border-ring transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">{t(lang, "years")}</label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => { setYears(e.target.value); setCompResult(null); }}
                  className="w-full bg-background border border-input rounded px-3 py-2 text-sm outline-none focus:border-ring transition-colors"
                />
              </div>
            </div>

            <button
              onClick={calculate}
              className="mt-4 w-full py-2 bg-primary text-primary-foreground rounded text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {t(lang, "calculate")}
            </button>

            {compResult !== null && (
              <div className="mt-4 bg-muted rounded p-4">
                <p className="text-xs text-muted-foreground">{t(lang, "final_amount")}</p>
                <p className="text-2xl font-bold mt-1">${compResult.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Ganancia: +${(compResult - parseFloat(principal)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>

          {/* Currency converter */}
          <div className="bg-card border border-card-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-primary/10 rounded">
                <ArrowRightLeft size={16} className="text-primary" />
              </div>
              <h2 className="text-sm font-semibold">{t(lang, "currency_converter")}</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">{t(lang, "amount")}</label>
                <input
                  type="number"
                  value={convAmount}
                  onChange={(e) => { setConvAmount(e.target.value); setConvResult(null); }}
                  className="w-full bg-background border border-input rounded px-3 py-2 text-sm outline-none focus:border-ring transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground block mb-1">{t(lang, "from")}</label>
                  <select
                    value={fromCurr}
                    onChange={(e) => { setFromCurr(e.target.value); setConvResult(null); }}
                    className="w-full bg-background border border-input rounded px-3 py-2 text-sm outline-none focus:border-ring transition-colors"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={swap}
                  className="mt-5 p-2 hover:bg-accent rounded transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ArrowRightLeft size={16} />
                </button>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground block mb-1">{t(lang, "to")}</label>
                  <select
                    value={toCurr}
                    onChange={(e) => { setToCurr(e.target.value); setConvResult(null); }}
                    className="w-full bg-background border border-input rounded px-3 py-2 text-sm outline-none focus:border-ring transition-colors"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={convert}
              className="mt-4 w-full py-2 bg-primary text-primary-foreground rounded text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {t(lang, "convert")}
            </button>

            {convResult !== null && (
              <div className="mt-4 bg-muted rounded p-4">
                <p className="text-xs text-muted-foreground">{t(lang, "result")}</p>
                <p className="text-2xl font-bold mt-1">
                  {convResult < 0.001
                    ? convResult.toExponential(6)
                    : convResult.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}{" "}
                  {toCurr}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
