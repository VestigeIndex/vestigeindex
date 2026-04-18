import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { cn, shortenAddress } from "../lib/utils";
import { Sun, Moon, Menu, Globe, ChevronDown, Wallet, LogOut, Loader2, AlertTriangle } from "lucide-react";
import type { Lang } from "../lib/i18n";
import {
  connectMetaMask,
  connectCoinbase,
  connectPhantom,
  connectWalletConnect,
} from "../lib/walletService";

interface WalletModalProps {
  onClose: () => void;
}

function WalletModal({ onClose }: WalletModalProps) {
  const { lang, setWallet } = useApp();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const wallets = [
    {
      key: "metamask" as const,
      label: "MetaMask",
      color: "#F6851B",
      description: "Wallet EVM — Ethereum, Polygon, BNB...",
    },
    {
      key: "walletconnect" as const,
      label: "WalletConnect",
      color: "#3B99FC",
      description: "Escaner QR — Trust, Rainbow, Argent...",
    },
    {
      key: "coinbase" as const,
      label: "Coinbase Wallet",
      color: "#0052FF",
      description: "Wallet EVM — Coinbase o compatible",
    },
    {
      key: "phantom" as const,
      label: "Phantom",
      color: "#AB9FF2",
      description: "Wallet Solana",
    },
  ];

  async function connect(type: "metamask" | "walletconnect" | "coinbase" | "phantom") {
    setError("");
    setConnecting(type);
    try {
      if (type === "metamask") {
        const w = await connectMetaMask();
        setWallet({ connected: true, address: shortenAddress(w.address), type: "metamask", evmWallet: w, solWallet: null });
        onClose();
      } else if (type === "walletconnect") {
        const w = await connectWalletConnect();
        setWallet({ connected: true, address: shortenAddress(w.address), type: "walletconnect", evmWallet: w, solWallet: null });
        onClose();
      } else if (type === "coinbase") {
        const w = await connectCoinbase();
        setWallet({ connected: true, address: shortenAddress(w.address), type: "coinbase", evmWallet: w, solWallet: null });
        onClose();
      } else if (type === "phantom") {
        const w = await connectPhantom();
        setWallet({ connected: true, address: w.publicKey.slice(0, 6) + "..." + w.publicKey.slice(-4), type: "phantom", evmWallet: null, solWallet: w });
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar wallet");
    } finally {
      setConnecting(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg p-6 w-84 shadow-xl max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold mb-1">{t(lang, "connect_wallet")}</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Conexion real — tus activos nunca salen de tu wallet
        </p>

        {error && (
          <div className="flex items-start gap-2 text-destructive text-xs mb-4 bg-destructive/10 rounded p-3">
            <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {wallets.map((w) => (
            <button
              key={w.key}
              onClick={() => connect(w.key)}
              disabled={!!connecting}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium text-left disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: w.color }}>
                {connecting === w.key ? (
                  <Loader2 size={14} className="animate-spin text-white" />
                ) : (
                  <Wallet size={14} className="text-white" />
                )}
              </div>
              <div>
                <div className="font-semibold text-xs">{w.label}</div>
                <div className="text-xs text-muted-foreground font-normal">{w.description}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t(lang, "cancel")}
        </button>
      </div>
    </div>
  );
}

export default function Header() {
  const { theme, setTheme, lang, setLang, wallet, setWallet, setSidebarOpen, sidebarOpen } = useApp();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const langs: { code: Lang; label: string }[] = [
    { code: "es", label: "Espanol" },
    { code: "en", label: "English" },
    { code: "zh", label: "中文" },
  ];

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function disconnect() {
    if (wallet.solWallet && typeof window !== "undefined" && window.solana) {
      window.solana.disconnect?.().catch(() => {});
    }
    if (wallet.type === "walletconnect" && typeof window !== "undefined") {
      const wc = (window as any).__wcProvider;
      wc?.disconnect?.().catch(() => {});
      delete (window as any).__wcProvider;
    }
    setWallet({
      connected: false,
      address: "",
      type: null,
      evmWallet: null,
      solWallet: null,
    });
  }

  const walletTypeColor: Record<string, string> = {
    metamask: "#F6851B",
    walletconnect: "#3B99FC",
    coinbase: "#0052FF",
    phantom: "#AB9FF2",
  };

  return (
    <>
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu size={18} />
          </button>
          
          {/* Brand - Institutional text */}
          <span className="text-sm font-bold tracking-[0.2em] hidden sm:block text-foreground">VESTIGE INDEX</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded text-xs border border-border hover:bg-accent transition-colors"
            >
              <Globe size={13} />
              <span className="uppercase">{lang}</span>
              <ChevronDown size={12} />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 top-8 bg-popover border border-popover-border rounded shadow-lg z-50 min-w-[110px]">
                {langs.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangMenuOpen(false); }}
                    className={cn(
                      "block w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors",
                      lang === l.code && "font-semibold"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title={theme === "dark" ? t(lang, "light_mode") : t(lang, "dark_mode")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {wallet.connected ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border text-xs font-mono">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: wallet.type ? walletTypeColor[wallet.type] : "#10b981" }}
                />
                <span>{wallet.address}</span>
              </div>
              <button
                onClick={disconnect}
                className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title={t(lang, "disconnect")}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setWalletModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Wallet size={13} />
              {t(lang, "connect_wallet")}
            </button>
          )}
        </div>
      </header>

      {walletModalOpen && <WalletModal onClose={() => setWalletModalOpen(false)} />}
    </>
  );
}
