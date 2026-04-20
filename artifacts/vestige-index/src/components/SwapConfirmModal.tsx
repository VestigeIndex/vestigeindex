import { useState, useEffect } from "react";
import { getFeeAddress, getNetworkName } from "../lib/swapService";
import { X, RefreshCw, AlertCircle } from "lucide-react";

interface SwapConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  symbol: string;
  amount: number;
  amountUsd: number;
  isBuy: boolean;
  chainId: number;
  isIndex: boolean;
  loading?: boolean;
}

export function SwapConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  symbol,
  amount,
  amountUsd,
  isBuy,
  chainId,
  isIndex,
  loading = false,
}: SwapConfirmModalProps) {
  const [livePrice, setLivePrice] = useState<number>(0);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(false);

  const feePercent = isIndex ? 0.5 : 0.3;
  const feeAddress = getFeeAddress(chainId);
  const networkName = getNetworkName(chainId);

  // Fetch live price from Binance
  useEffect(() => {
    if (!isOpen) return;

    const fetchPrice = async () => {
      setPriceLoading(true);
      setPriceError(false);
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}USDT`
        );
        if (response.ok) {
          const data = await response.json();
          setLivePrice(parseFloat(data.price));
        } else {
          setPriceError(true);
          // Use fallback price based on amount
          if (amountUsd > 0 && amount > 0) {
            setLivePrice(amountUsd / amount);
          }
        }
      } catch (e) {
        console.error('Error fetching price:', e);
        setPriceError(true);
        // Use fallback
        if (amountUsd > 0 && amount > 0) {
          setLivePrice(amountUsd / amount);
        }
      }
      setPriceLoading(false);
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [isOpen, symbol, amountUsd, amount]);

  if (!isOpen) return null;

  const totalValue = amount * livePrice;
  const feeAmount = totalValue * (feePercent / 100);
  const totalWithFee = isBuy ? totalValue + feeAmount : totalValue;
  const receiveAmount = isBuy ? amount : totalValue - feeAmount;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#1a1a1a",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "420px",
          width: "90%",
          border: "1px solid #333",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "600", margin: 0 }}>
            {isBuy ? "Confirmar Compra" : "Confirmar Venta"}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", padding: "4px" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Price Section */}
        <div
          style={{
            background: "#111",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "16px",
            border: "1px solid #222",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ color: "#888", fontSize: "13px" }}>Precio de mercado</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {priceLoading && <RefreshCw size={12} className="animate-spin" style={{ color: "#888" }} />}
              <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#fff", fontSize: "14px" }}>
                ${livePrice > 0 ? livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : "—"}
              </span>
            </div>
          </div>
          {priceError && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#f59e0b", fontSize: "11px", marginTop: "8px" }}>
              <AlertCircle size={12} />
              <span>Precio estimado</span>
            </div>
          )}
        </div>

        {/* Transaction Details */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
            <span style={{ color: "#888" }}>Cantidad a {isBuy ? "comprar" : "vender"}</span>
            <span style={{ color: "#fff", fontWeight: "500" }}>{amount.toFixed(6)} {symbol.toUpperCase()}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
            <span style={{ color: "#888" }}>Valor en USD</span>
            <span style={{ color: "#fff", fontWeight: "500" }}>${totalValue.toFixed(2)}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              fontSize: "14px",
              paddingTop: "10px",
              borderTop: "1px solid #222",
            }}
          >
            <span style={{ color: "#888" }}>Comisión ({feePercent}%)</span>
            <span style={{ color: "#f59e0b", fontWeight: "500" }}>-${feeAmount.toFixed(4)}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
              fontSize: "14px",
              paddingTop: "10px",
              borderTop: "1px solid #222",
            }}
          >
            <span style={{ color: "#888" }}>{isBuy ? "Total a pagar" : "Recibirás"}</span>
            <span style={{ color: isBuy ? "#fff" : "#22c55e", fontWeight: "700", fontSize: "16px" }}>
              {isBuy ? `$${totalWithFee.toFixed(2)}` : `${receiveAmount.toFixed(6)} ${symbol.toUpperCase()}`}
            </span>
          </div>
        </div>

        {/* Network & Fee Address */}
        <div
          style={{
            background: "#0a0a0a",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "11px",
            color: "#666",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span>Red</span>
            <span style={{ color: "#888" }}>{networkName}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Comisión a</span>
            <span style={{ fontFamily: "monospace", color: "#888" }}>
              {feeAddress.slice(0, 6)}...{feeAddress.slice(-4)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: "14px",
              background: "#222",
              border: "1px solid #333",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "14px",
              background: "#22c55e",
              border: "none",
              borderRadius: "8px",
              color: "#000",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading && <RefreshCw size={14} className="animate-spin" />}
            {loading ? "Ejecutando..." : "Confirmar"}
          </button>
        </div>

        <p style={{ textAlign: "center", color: "#666", fontSize: "11px", marginTop: "12px" }}>
          Después de confirmar, firma la transacción en tu wallet
        </p>
      </div>
    </div>
  );
}