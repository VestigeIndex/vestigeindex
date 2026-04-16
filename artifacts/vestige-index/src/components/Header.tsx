import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { cn, shortenAddress } from "../lib/utils";
import { Sun, Moon, Menu, Globe, ChevronDown, Wallet, LogOut } from "lucide-react";
import type { Lang } from "../lib/i18n";

interface WalletModalProps {
  onClose: () => void;
}

function WalletModal({ onClose }: WalletModalProps) {
  const { lang, setWallet } = useApp();

  const wallets = [
    { key: "metamask", label: t(lang, "connect_metamask"), color: "#F6851B" },
    { key: "walletconnect", label: t(lang, "connect_walletconnect"), color: "#3B99FC" },
    { key: "coinbase", label: t(lang, "connect_coinbase"), color: "#0052FF" },
    { key: "phantom", label: t(lang, "connect_phantom"), color: "#AB9FF2" },
  ] as const;

  function connect(type: "metamask" | "walletconnect" | "coinbase" | "phantom") {
    const fakeAddress = `0x${Math.random().toString(16).slice(2, 12)}...${Math.random().toString(16).slice(2, 6)}`;
    setWallet({ connected: true, address: fakeAddress, type });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg p-6 w-80 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold mb-4">{t(lang, "connect_wallet")}</h2>
        <div className="flex flex-col gap-2">
          {wallets.map((w) => (
            <button
              key={w.key}
              onClick={() => connect(w.key)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium text-left"
            >
              <div className="w-6 h-6 rounded-full" style={{ background: w.color }} />
              {w.label}
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
          <span className="text-sm font-bold tracking-widest hidden sm:block">VESTIGE INDEX</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
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

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title={theme === "dark" ? t(lang, "light_mode") : t(lang, "dark_mode")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Wallet button */}
          {wallet.connected ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border text-xs font-mono">
                <Wallet size={12} className="text-emerald-500" />
                <span>{wallet.address}</span>
              </div>
              <button
                onClick={() => setWallet({ connected: false, address: "", type: null })}
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
