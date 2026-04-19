import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "../lib/i18n";
import type { BrowserProvider, JsonRpcSigner } from "ethers";

export type Theme = "dark" | "light";

export interface EVMWalletState {
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  address: string;
  chainId: number;
}

export interface SolanaWalletState {
  publicKey: string;
  sendTransaction: (tx: unknown, connection: unknown) => Promise<string>;
  signTransaction?: (tx: unknown) => Promise<unknown>;
}

export type WalletType = "metamask" | "coinbase" | "phantom" | "walletconnect" | "trust";

export interface WalletState {
  connected: boolean;
  address: string;
  type: WalletType | null;
  evmWallet: EVMWalletState | null;
  solWallet: SolanaWalletState | null;
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

const DEFAULT_WALLET: WalletState = {
  connected: false,
  address: "",
  type: null,
  evmWallet: null,
  solWallet: null,
};

const THEME_KEY = "vestige-theme";
const LANG_KEY = "vestige-lang";
const SIDEBAR_KEY = "vestige-sidebar";

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  });
  const [langState, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "es";
    const saved = window.localStorage.getItem(LANG_KEY);
    return saved === "en" || saved === "zh" ? saved : "es";
  });
  const [wallet, setWallet] = useState<WalletState>(DEFAULT_WALLET);
  const [sidebarOpenState, setSidebarOpenState] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(SIDEBAR_KEY) !== "closed";
  });
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [versionClickCount, setVersionClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme);
  }

  function setLang(nextLang: Lang) {
    setLangState(nextLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_KEY, nextLang);
    }
  }

  function setSidebarOpen(nextValue: boolean) {
    setSidebarOpenState(nextValue);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_KEY, nextValue ? "open" : "closed");
    }
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on?.("accountsChanged", (accounts: string[]) => {
        if (!accounts.length) {
          setWallet(DEFAULT_WALLET);
        }
      });
    }

    if (typeof window !== "undefined" && window.solana) {
      window.solana.on?.("disconnect", () => {
        setWallet((current) => (current.type === "phantom" ? DEFAULT_WALLET : current));
      });
    }
  }, []);

  function handleVersionClick() {
    const now = Date.now();

    if (now - lastClickTime < 800) {
      const nextCount = versionClickCount + 1;
      setVersionClickCount(nextCount);
      if (nextCount >= 2) {
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
        lang: langState,
        setLang,
        wallet,
        setWallet,
        sidebarOpen: sidebarOpenState,
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
