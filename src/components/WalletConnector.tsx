import React, { useEffect, useMemo, useState } from "react";
import { BrowserProvider } from "ethers";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import { Wallet, X } from "lucide-react";
import { useApp, type WalletType } from "../context/AppContext";
import { cn } from "../lib/utils";

function detectWalletType(name?: string): WalletType {
  const normalized = (name ?? "").toLowerCase();
  if (normalized.includes("meta")) return "metamask";
  if (normalized.includes("coinbase")) return "coinbase";
  if (normalized.includes("walletconnect")) return "walletconnect";
  if (normalized.includes("trust")) return "trust";
  return "metamask";
}

export default function WalletConnector() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingWallet, setPendingWallet] = useState<string | null>(null);
  const { setWallet } = useApp();

  const { address, chain, connector, isConnected: isEvmConnected } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { data: balance } = useBalance({ address });

  const {
    publicKey,
    connected: isSolanaConnected,
    connecting: isSolanaConnecting,
    wallets: solanaWallets,
    select,
    disconnect: disconnectSolana,
    wallet: activeSolanaWallet,
    sendTransaction,
    signTransaction,
  } = useWallet();

  useEffect(() => {
    const syncWallet = async () => {
      if (isEvmConnected && address && connector) {
        try {
          const provider = typeof window !== "undefined" && window.ethereum
            ? new BrowserProvider(window.ethereum)
            : null;
          const signer = provider ? await provider.getSigner() : null;

          if (provider && signer) {
            setWallet({
              connected: true,
              address,
              type: detectWalletType(connector.name),
              evmWallet: {
                provider,
                signer,
                address,
                chainId: chain?.id ?? 1,
              },
              solWallet: null,
            });
            return;
          }
        } catch {
          setError("We could not prepare the EVM wallet signer. Please reconnect.");
        }
      }

      if (isSolanaConnected && publicKey) {
        setWallet({
          connected: true,
          address: publicKey.toBase58(),
          type: activeSolanaWallet?.adapter.name.toLowerCase().includes("trust") ? "trust" : "phantom",
          evmWallet: null,
          solWallet: {
            publicKey: publicKey.toBase58(),
            sendTransaction: (transaction, connection) => sendTransaction(transaction as never, connection as never),
            signTransaction: signTransaction
              ? (transaction) => signTransaction(transaction as never)
              : undefined,
          },
        });
        return;
      }

      setWallet({
        connected: false,
        address: "",
        type: null,
        evmWallet: null,
        solWallet: null,
      });
    };

    void syncWallet();
  }, [
    activeSolanaWallet?.adapter.name,
    address,
    chain?.id,
    connector,
    isEvmConnected,
    isSolanaConnected,
    publicKey,
    setWallet,
    sendTransaction,
    signTransaction,
  ]);

  const availableEvmConnectors = useMemo(
    () => connectors.filter((item) => item.type !== "injected" || item.name),
    [connectors],
  );

  const availableSolanaWallets = useMemo(
    () => solanaWallets.filter((item) => item.readyState !== WalletReadyState.Unsupported),
    [solanaWallets],
  );

  const currentAddress = isEvmConnected ? address : publicKey?.toBase58();

  async function handleEvmConnect(connectorId: string) {
    const selectedConnector = availableEvmConnectors.find((item) => item.id === connectorId);
    if (!selectedConnector) return;

    setPendingWallet(connectorId);
    setError(null);

    try {
      await connectAsync({ connector: selectedConnector });
      setIsOpen(false);
    } catch {
      setError("We could not connect that wallet. Please approve the request in your wallet and try again.");
    } finally {
      setPendingWallet(null);
    }
  }

  async function handleSolanaConnect(walletName: WalletName) {
    setPendingWallet(walletName);
    setError(null);

    try {
      select(walletName);
      setIsOpen(false);
    } catch {
      setError("We could not open the Solana wallet. Please make sure the extension is installed and unlocked.");
    } finally {
      setPendingWallet(null);
    }
  }

  async function handleDisconnect() {
    setError(null);

    try {
      if (isEvmConnected) {
        await disconnectAsync();
      }
      if (isSolanaConnected) {
        await disconnectSolana();
      }
    } catch {
      setError("We could not disconnect the wallet cleanly. Reload the page if the session remains stuck.");
    }
  }

  const isConnected = isEvmConnected || isSolanaConnected;

  if (isConnected) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-white/[0.05] px-3 py-2 shadow-[0_0_30px_rgba(59,130,246,0.08)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
          <Wallet className="h-4 w-4 text-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Wallet connected</div>
          <div className="truncate text-sm font-medium text-foreground">
            {currentAddress ? `${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}` : "Connected"}
          </div>
          {balance?.formatted && isEvmConnected && (
            <div className="text-xs text-muted-foreground">
              {Number(balance.formatted).toFixed(3)} {balance.symbol}
            </div>
          )}
        </div>
        <button
          onClick={() => void handleDisconnect()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground"
          title="Disconnect wallet"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-medium text-foreground shadow-[0_0_30px_rgba(99,102,241,0.12)] transition-all hover:border-white/20 hover:bg-white/[0.08]"
      >
        <Wallet className="h-4 w-4" />
        Connect wallet
      </button>

      {isOpen && (
        <>
          <button
            aria-label="Close wallet modal backdrop"
            className="fixed inset-0 z-40 cursor-default bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-14 z-50 w-[26rem] rounded-[28px] border border-border/80 bg-popover/95 p-5 shadow-2xl backdrop-blur-2xl">
            <div className="mb-4">
              <div className="text-[11px] uppercase tracking-[0.26em] text-muted-foreground">Unified access</div>
              <h3 className="mt-2 font-display text-xl tracking-[0.08em] text-foreground">Connect execution wallet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                EVM execution is available through MetaMask, Trust Wallet, Coinbase Wallet and WalletConnect.
                Solana execution is available through Phantom and Trust Wallet.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">EVM</div>
                <div className="space-y-2">
                  {availableEvmConnectors.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => void handleEvmConnect(item.id)}
                      disabled={pendingWallet === item.id}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition-all hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-60"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">Secure EVM execution</div>
                      </div>
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {pendingWallet === item.id ? "Opening" : "Connect"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Solana</div>
                <div className="space-y-2">
                  {availableSolanaWallets.map((item) => (
                    <button
                      key={item.adapter.name}
                      onClick={() => void handleSolanaConnect(item.adapter.name)}
                      disabled={pendingWallet === item.adapter.name || isSolanaConnecting}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition-all hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-60"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.adapter.name}</div>
                        <div className="text-xs text-muted-foreground">Solana execution</div>
                      </div>
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {pendingWallet === item.adapter.name ? "Opening" : "Connect"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={cn(
                "mt-4 rounded-2xl border px-4 py-3 text-sm",
                error
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-white/10 bg-white/[0.04] text-muted-foreground",
              )}
            >
              {error ??
                "Vestige routes swaps through institutional aggregators and sends protocol fees to the configured treasury wallets."}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
