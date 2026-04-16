import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  signTransaction: (tx: any) => Promise<any>;
  signAndSendTransaction: (tx: any) => Promise<{ signature: string }>;
}

export type WalletType = "metamask" | "coinbase" | "phantom";

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

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [lang, setLang] = useState<Lang>("es");
  const [wallet, setWallet] = useState<WalletState>(DEFAULT_WALLET);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [versionClickCount, setVersionClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  function setTheme(t: Theme) {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }

  useEffect(() => {
    document.documentElement.classList.add("dark");

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on?.("accountsChanged", (accounts: string[]) => {
        if (!accounts.length) {
          setWallet(DEFAULT_WALLET);
        }
      });
      window.ethereum.on?.("chainChanged", () => {
        window.location.reload();
      });
    }
    if (typeof window !== "undefined" && window.solana) {
      window.solana.on?.("disconnect", () => {
        setWallet((w) => w.type === "phantom" ? DEFAULT_WALLET : w);
      });
    }
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
