import React, { useMemo, useState } from "react";
import { Globe, Menu, Moon, Sun } from "lucide-react";
import WalletConnector from "./WalletConnector";
import { useApp } from "../context/AppContext";
import { cn } from "../lib/utils";
import type { Lang } from "../lib/i18n";

export default function Header() {
  const { theme, setTheme, lang, setLang, setSidebarOpen, sidebarOpen } = useApp();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages = useMemo<{ code: Lang; label: string }[]>(
    () => [
      { code: "es", label: "ES" },
      { code: "en", label: "EN" },
      { code: "zh", label: "ZH" },
    ],
    [],
  );

  return (
    <header className="relative z-10 border-b border-border/80 bg-background/80 px-4 py-4 backdrop-blur-xl md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-white/[0.04] text-muted-foreground transition-all hover:border-white/20 hover:text-foreground md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div>
            <div className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              Real-time digital asset infrastructure
            </div>
            <h1 className="font-display text-2xl tracking-[0.12em] text-foreground">Vestige Index</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen((open) => !open)}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border/80 bg-white/[0.04] px-4 text-sm text-foreground transition-all hover:border-white/20"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{lang.toUpperCase()}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 top-14 w-32 rounded-2xl border border-border/80 bg-popover/95 p-2 shadow-2xl backdrop-blur-xl">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      setLang(language.code);
                      setLangMenuOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.06]",
                      lang === language.code ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-white/[0.04] text-muted-foreground transition-all hover:border-white/20 hover:text-foreground"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <WalletConnector />
        </div>
      </div>
    </header>
  );
}
