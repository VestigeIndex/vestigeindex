import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { EVM_FEE_ADDRESS, SOL_FEE_ADDRESS, TOP100_FEE, INDEX_FEE } from "../lib/constants";
import { formatCurrency } from "../lib/utils";
import { X, ArrowDownUp, AlertCircle, CheckCircle2 } from "lucide-react";

interface SwapModalProps {
  coin: {
    name: string;
    symbol: string;
    price: number;
    image?: string;
  };
  mode: "buy" | "sell";
  feeRate?: number;
  onClose: () => void;
}

export default function SwapModal({ coin, mode, feeRate = TOP100_FEE, onClose }: SwapModalProps) {
  const { lang, wallet } = useApp();
  const [amountUsd, setAmountUsd] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const usdVal = parseFloat(amountUsd) || 0;
  const feeAmount = usdVal * feeRate;
  const netAmount = usdVal - feeAmount;
  const tokenAmount = coin.price > 0 ? netAmount / coin.price : 0;

  async function handleSwap() {
    if (!wallet.connected) {
      setErrorMsg(t(lang, "connect_wallet_first"));
      setStatus("error");
      return;
    }
    if (usdVal <= 0) return;

    setStatus("processing");
    await new Promise((r) => setTimeout(r, 2000));
    setStatus("success");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg p-6 w-96 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {coin.image && (
              <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
            )}
            <div>
              <h2 className="text-sm font-semibold">
                {mode === "buy" ? t(lang, "buy") : t(lang, "sell")} {coin.symbol.toUpperCase()}
              </h2>
              <p className="text-xs text-muted-foreground">{formatCurrency(coin.price)} / {coin.symbol.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded transition-colors">
            <X size={16} />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
            <p className="text-sm font-medium">Swap completado exitosamente</p>
            <p className="text-xs text-muted-foreground text-center">
              Comision enviada a {wallet.type === "phantom" ? SOL_FEE_ADDRESS.slice(0, 8) : EVM_FEE_ADDRESS.slice(0, 10)}...
            </p>
            <button onClick={onClose} className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium">
              {t(lang, "close")}
            </button>
          </div>
        ) : (
          <>
            {/* Amount input */}
            <div className="mb-4">
              <label className="block text-xs text-muted-foreground mb-1.5">
                {t(lang, "quantity_usd")}
              </label>
              <div className="flex items-center border border-input rounded px-3 py-2 bg-background focus-within:border-ring transition-colors">
                <span className="text-muted-foreground text-sm mr-2">$</span>
                <input
                  type="number"
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-sm outline-none"
                  min="0"
                />
              </div>
            </div>

            {/* Summary */}
            {usdVal > 0 && (
              <div className="bg-muted rounded p-3 mb-4 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(lang, "you_pay")}</span>
                  <span>{formatCurrency(usdVal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(lang, "fee")} ({(feeRate * 100).toFixed(1)}%)</span>
                  <span className="text-amber-600 dark:text-amber-400">{formatCurrency(feeAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5">
                  <span className="text-muted-foreground">{t(lang, "you_receive")}</span>
                  <span className="font-medium">{tokenAmount.toFixed(6)} {coin.symbol.toUpperCase()}</span>
                </div>
                <div className="text-muted-foreground pt-1 border-t border-border">
                  Fee address: {wallet.type === "phantom"
                    ? `${SOL_FEE_ADDRESS.slice(0, 8)}...`
                    : `${EVM_FEE_ADDRESS.slice(0, 10)}...`}
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 text-destructive text-xs mb-3">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {!wallet.connected && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs mb-3">
                <AlertCircle size={14} />
                <span>{t(lang, "connect_wallet_first")}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded border border-border text-sm hover:bg-accent transition-colors"
              >
                {t(lang, "cancel")}
              </button>
              <button
                onClick={handleSwap}
                disabled={status === "processing" || usdVal <= 0}
                className="flex-1 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === "processing" ? (
                  <span className="flex items-center justify-center gap-1">
                    <ArrowDownUp size={13} className="animate-spin" />
                    {t(lang, "swap_in_progress")}
                  </span>
                ) : (
                  t(lang, "confirm")
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
