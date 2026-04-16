import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Lang } from "../lib/i18n";

type Theme = "dark" | "light";

interface WalletState {
  connected: boolean;
  address: string;
  type: "metamask" | "walletconnect" | "coinbase" | "phantom" | null;
}

interface AppContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  wallet: WalletState;
  setWallet: (w: WalletState) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  adminPanelOpen: boolean;
  setAdminPanelOpen: (v: boolean) => void;
  versionClickCount: number;
  handleVersionClick: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [lang, setLang] = useState<Lang>("es");
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: "",
    type: null,
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [versionClickCount, setVersionClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  function setTheme(t: Theme) {
    setThemeState(t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  function handleVersionClick() {
    const now = Date.now();
    if (now - lastClickTime < 800) {
      const newCount = versionClickCount + 1;
      setVersionClickCount(newCount);
      if (newCount >= 2) {
        setAdminPanelOpen(true);
        setVersionClickCount(0);
      }
    } else {
      setVersionClickCount(1);
    }
    setLastClickTime(now);
  }

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        lang,
        setLang,
        wallet,
        setWallet,
        sidebarOpen,
        setSidebarOpen,
        adminPanelOpen,
        setAdminPanelOpen,
        versionClickCount,
        handleVersionClick,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
