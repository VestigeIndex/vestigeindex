import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";
import { cn } from "../lib/utils";
import { Sun, Moon, Menu, Globe, ChevronDown } from "lucide-react";
import type { Lang } from "../lib/i18n";
import { WalletConnector } from "./WalletConnector";

export default function Header() {
  const { theme, setTheme, lang, setLang, setSidebarOpen, sidebarOpen } = useApp();
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

          {/* Unified Wallet Connector */}
          <WalletConnector />
        </div>
      </header>
    </>
  );
}
