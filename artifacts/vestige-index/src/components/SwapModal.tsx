import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { EVM_FEE_ADDRESS, SOL_FEE_ADDRESS, TOP100_FEE } from "../lib/constants";
import { formatCurrency } from "../lib/utils";
import { X, ArrowDownUp, AlertCircle, CheckCircle2, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import {
  getQuote,
  executeEVMSwap,
  getTokenBySymbol,
  NATIVE_ETH,
  USDT_MAINNET,
  type SwapQuote,
  getFeeAddress,
  getNetworkName,
} from "../lib/swapService";
import { parseUnits } from "ethers";
import { SwapConfirmModal } from "./SwapConfirmModal";

interface SwapModalProps {
  coin: {
    name: string;
    symbol: string;
    price: number;
    image?: string;
    solana?: boolean;
  };
  mode: "buy" | "sell";
  feeRate?: number;
  onClose: () => void;
}

function TxLink({ hash, isSolana }: { hash: string; isSolana?: boolean }) {
  const url = isSolana
    ? `https://solscan.io/tx/${hash}`
    : `https://etherscan.io/tx/${hash}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-xs text-primary hover:underline"
    >
      Ver en {isSolana ? "Solscan" : "Etherscan"}
      <ExternalLink size={11} />
    </a>
  );
}

export default function SwapModal({ coin, mode, feeRate = TOP100_FEE, onClose }: SwapModalProps) {
  const { lang, wallet } = useApp();
  const [amountUsd, setAmountUsd] = useState("");
  const [status, setStatus] = useState<"idle" | "quoting" | "processing" | "success" | "error">("idle");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [swapAmount, setSwapAmount] = useState<{ amount: number; amountUsd: number }>({ amount: 0, amountUsd: 0 });
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const usdVal = parseFloat(amountUsd) || 0;
  const feeAmount = usdVal * feeRate;
  const netUsd = usdVal - feeAmount;

  const isSolanaWallet = wallet.type === "phantom";
  const isEVMWallet = wallet.type === "metamask" || wallet.type === "coinbase";

  const srcToken = mode === "buy"
    ? getTokenBySymbol("ETH")
    : getTokenBySymbol(coin.symbol);
  const dstToken = mode === "buy"
    ? getTokenBySymbol(coin.symbol)
    : getTokenBySymbol("ETH");

  const canSwapOnChain = isEVMWallet && srcToken && dstToken;

  useEffect(() => {
    if (!canSwapOnChain || usdVal <= 0 || !wallet.evmWallet) {
      setQuote(null);
      return;
    }

    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(async () => {
      setStatus("quoting");
      setErrorMsg("");
      try {
        const ethPrice = coin.symbol === "ETH" ? coin.price : (coin.price || 1);
        const ethPriceForUsd = 3000;
        const amountEth = netUsd / ethPriceForUsd;
        const amountWei = parseUnits(
          Math.max(amountEth, 0.00001).toFixed(18).slice(0, 20),
          18
        ).toString();

        const q = await getQuote(
          srcToken!.address,
          dstToken!.address,
          amountWei,
          wallet.evmWallet!.chainId,
          wallet.evmWallet!.address
        );
        setQuote(q);
        setStatus("idle");
      } catch (err: any) {
        setQuote(null);
        setStatus("idle");
      }
    }, 700);

    return () => {
      if (quoteTimer.current) clearTimeout(quoteTimer.current);
    };
  }, [amountUsd, canSwapOnChain]);

  function openConfirmModal() {
    if (!wallet.connected) {
      setErrorMsg(t(lang, "connect_wallet_first"));
      setStatus("error");
      return;
    }
    if (usdVal <= 0) return;
    if (!canSwapOnChain && !isSolanaWallet) {
      setErrorMsg(
        `El token ${coin.symbol} no tiene contrato EVM mapeado para swap directo. Opera en el exchange correspondiente.`
      );
      setStatus("error");
      return;
    }

    // Calculate swap amount based on price
    const ethPriceForUsd = coin.price || 3000;
    const amountTokens = mode === "buy" 
      ? netUsd / ethPriceForUsd 
      : (usdVal / coin.price);
    
    setSwapAmount({ amount: amountTokens, amountUsd: usdVal });
    setShowConfirmModal(true);
  }

  async function handleConfirmSwap() {
    setShowConfirmModal(false);
    setStatus("processing");
    setErrorMsg("");

    try {
      if (isEVMWallet && srcToken && dstToken && wallet.evmWallet) {
        const ethPriceForUsd = 3000;
        const hash = await executeEVMSwap(
          wallet.evmWallet.signer,
          srcToken,
          dstToken,
          netUsd,
          ethPriceForUsd,
          wallet.evmWallet.chainId
        );
        setTxHash(hash);
        setStatus("success");
      } else if (isSolanaWallet && wallet.solWallet) {
        const { getSolanaQuote, executeSolanaSwap } = await import("../lib/swapService");
        const SOL_MINT = "So11111111111111111111111111111111111111112";
        const USDC_SOL = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

        const amountLamports = Math.round((netUsd / 100) * 1e9).toString();
        const q = await getSolanaQuote(SOL_MINT, USDC_SOL, amountLamports);
        const sig = await executeSolanaSwap(wallet.solWallet, q.quoteResponse);
        setTxHash(sig);
        setStatus("success");
      } else {
        setErrorMsg("Wallet no compatible con este par de tokens.");
        setStatus("error");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al ejecutar el swap");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {coin.image && (
              <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
            )}
            <div>
              <h2 className="text-sm font-semibold">
                {mode === "buy" ? t(lang, "buy") : t(lang, "sell")} {coin.symbol.toUpperCase()}
              </h2>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(coin.price)} / {coin.symbol.toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded transition-colors">
            <X size={16} />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
            <p className="text-sm font-semibold">Swap ejecutado en blockchain</p>
            {txHash && (
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground font-mono break-all">{txHash.slice(0, 20)}...{txHash.slice(-8)}</p>
                <TxLink hash={txHash} isSolana={isSolanaWallet} />
              </div>
            )}
            <p className="text-xs text-muted-foreground text-center mt-1">
              Comision enviada a {isSolanaWallet ? `${SOL_FEE_ADDRESS.slice(0, 8)}...` : `${EVM_FEE_ADDRESS.slice(0, 10)}...`}
            </p>
            <button onClick={onClose} className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium">
              {t(lang, "close")}
            </button>
          </div>
        ) : (
          <>
            {!wallet.connected && (
              <div className="flex items-center gap-2 text-amber-500 text-xs mb-4 bg-amber-500/10 rounded p-3">
                <AlertCircle size={13} className="flex-shrink-0" />
                <span>{t(lang, "connect_wallet_first")}</span>
              </div>
            )}

            {wallet.connected && !canSwapOnChain && !isSolanaWallet && (
              <div className="text-xs text-muted-foreground bg-muted rounded p-3 mb-4">
                Conecta MetaMask o Coinbase Wallet para swaps EVM, o Phantom para Solana.
              </div>
            )}

            {wallet.connected && (
              <div className="mb-3 text-xs flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: wallet.type === "metamask" ? "#F6851B" : wallet.type === "coinbase" ? "#0052FF" : "#AB9FF2" }}
                />
                <span className="text-muted-foreground font-mono">{wallet.address}</span>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs text-muted-foreground mb-1.5">
                {t(lang, "quantity_usd")} (en {mode === "buy" ? "ETH equivalente" : coin.symbol})
              </label>
              <div className="flex items-center border border-input rounded px-3 py-2 bg-background focus-within:border-ring transition-colors">
                <span className="text-muted-foreground text-sm mr-2">$</span>
                <input
                  type="number"
                  value={amountUsd}
                  onChange={(e) => { setAmountUsd(e.target.value); setStatus("idle"); setErrorMsg(""); }}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-sm outline-none"
                  min="0"
                />
              </div>
            </div>

            {usdVal > 0 && (
              <div className="bg-muted rounded p-3 mb-4 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(lang, "you_pay")}</span>
                  <span>{formatCurrency(usdVal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t(lang, "fee")} ({(feeRate * 100).toFixed(1)}%)</span>
                  <span className="text-amber-500">{formatCurrency(feeAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5">
                  <span className="text-muted-foreground">{t(lang, "you_receive")}</span>
                  {status === "quoting" ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <RefreshCw size={11} className="animate-spin" />
                      Obteniendo cotizacion...
                    </span>
                  ) : quote ? (
                    <span className="font-medium">
                      ≈ {parseFloat(quote.dstAmountFormatted).toFixed(6)} {(quote.toToken?.symbol || coin.symbol).toUpperCase()}
                    </span>
                  ) : (
                    <span className="font-medium">
                      ≈ {(netUsd / (coin.price || 1)).toFixed(6)} {coin.symbol.toUpperCase()}
                    </span>
                  )}
                </div>
                {quote && (
                  <div className="text-muted-foreground text-xs flex justify-between pt-1 border-t border-border">
                    <span>Gas estimado</span>
                    <span>{quote.gas?.toLocaleString() ?? "—"} gas</span>
                  </div>
                )}
                <div className="text-muted-foreground pt-1 border-t border-border">
                  Fee address: {isSolanaWallet ? `${SOL_FEE_ADDRESS.slice(0, 8)}...` : `${EVM_FEE_ADDRESS.slice(0, 10)}...`}
                </div>
              </div>
            )}

            {status === "error" && errorMsg && (
              <div className="flex items-start gap-2 text-destructive text-xs mb-3 bg-destructive/10 rounded p-3">
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
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
                onClick={openConfirmModal}
                disabled={status === "processing" || status === "quoting" || usdVal <= 0 || !wallet.connected}
                className="flex-1 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === "processing" ? (
                  <span className="flex items-center justify-center gap-1">
                    <Loader2 size={13} className="animate-spin" />
                    {t(lang, "swap_in_progress")}
                  </span>
                ) : status === "quoting" ? (
                  <span className="flex items-center justify-center gap-1">
                    <RefreshCw size={13} className="animate-spin" />
                    Cotizando...
                  </span>
                ) : (
                  t(lang, "confirm")
                )}
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-3">
              La transaccion se firma en tu wallet. Vestige Index no custodia fondos.
            </p>
          </>
        )}
      </div>

      <SwapConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSwap}
        symbol={coin.symbol}
        amount={swapAmount.amount}
        amountUsd={swapAmount.amountUsd}
        isBuy={mode === "buy"}
        chainId={wallet.evmWallet?.chainId || 1}
        isIndex={feeRate === 0.005}
        loading={status === "processing"}
      />
    </div>
  );
}
