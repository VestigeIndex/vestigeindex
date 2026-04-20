import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { BrowserProvider, JsonRpcSigner } from "ethers";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<string[]>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export default function WalletConnector() {
  const { wallet, setWallet } = useApp();
  const [loading, setLoading] = useState(false);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
          if (accounts.length > 0) {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);
            
            setWallet({
              connected: true,
              address: address,
              type: "metamask",
              evmWallet: { provider, signer, address, chainId },
              solWallet: null,
            });
          }
        } catch (e) {
          console.error("Error checking connection:", e);
        }
      }
    };
    checkConnection();
  }, [setWallet]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet({
            connected: false,
            address: "",
            type: null,
            evmWallet: null,
            solWallet: null,
          });
        } else {
          setWallet(prev => ({ ...prev, address: accounts[0] }));
        }
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    }
  }, [setWallet]);

  const connect = async () => {
    if (!window.ethereum) {
      alert("MetaMask no encontrado. Instala la extensión MetaMask.");
      return;
    }
    setLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];
      
      if (accounts.length > 0) {
        // Get provider and signer
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        setWallet({
          connected: true,
          address: address,
          type: "metamask",
          evmWallet: { provider, signer, address, chainId },
          solWallet: null,
        });
      }
    } catch (e) {
      console.error("Connection failed:", e);
      alert("Error al conectar wallet");
    }
    setLoading(false);
  };

  const disconnect = () => {
    setWallet({
      connected: false,
      address: "",
      type: null,
      evmWallet: null,
      solWallet: null,
    });
  };

  if (wallet.connected && wallet.address) {
    return (
      <button
        onClick={disconnect}
        className="text-sm bg-red-600 px-4 py-2 rounded-lg text-white font-medium hover:bg-red-700 transition"
      >
        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={loading}
      className="flex items-center gap-2 text-sm bg-primary px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition disabled:opacity-50"
    >
      {loading ? "Conectando..." : "Conectar Wallet"}
    </button>
  );
}