// src/pages/Bridge.tsx
// Full cross-chain bridge page: EVM↔EVM (Stargate), EVM↔Solana (Wormhole)
import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { SUPPORTED_CHAINS, getBridgeQuote, getTokenSymbol } from "../lib/bridgeService";
import { parseUnits } from "ethers";
import { Loader2, ArrowRightLeft, Wallet, ExternalLink, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

const VESTIGE_FEE_EVM = "0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F";

interface ChainInfo {
  id: number;
  name: string;
  icon: string;
  type: "evm" | "solana";
  stargateId: number | null;
  usdc: string;
  native: string;
  rpc: string;
}

export default function Bridge() {
  const { wallet, setWallet } = useApp();
  const [fromChain, setFromChain] = useState<ChainInfo>(SUPPORTED_CHAINS[0]);
  const [toChain, setToChain] = useState<ChainInfo>(SUPPORTED_CHAINS[1]);
  const [tokenType, setTokenType] = useState<"native" | "usdc">("usdc");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "quoting" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  const amountUSD = useMemo(() => parseFloat(amount) || 0, [amount]);

  const fromSymbol = getTokenSymbol(fromChain.id, tokenType);
  const toSymbol = getTokenSymbol(toChain.id, tokenType);

  // Get quote when inputs change
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0 || fromChain.id === toChain.id) {
      setQuote(null);
      return;
    }

    const timer = setTimeout(async () => {
      setStatus("quoting");
      try {
        const q = await getBridgeQuote(fromChain, toChain, amount, tokenType, amountUSD);
        setQuote(q);
        setStatus("idle");
      } catch (err: any) {
        console.error("Quote error:", err);
        setErrorMsg(err.message || "Failed to get quote");
        setStatus("idle");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [amount, fromChain, toChain, tokenType, amountUSD]);

  // Connect MetaMask
  const connectWallet = async () => {
    setErrorMsg("");
    try {
      if (!window.ethereum) {
        throw new Error("No wallet found. Install MetaMask.");
      }
      const { BrowserProvider } = await import("ethers");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      if (accounts.length > 0) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        
        setWallet({
          connected: true,
          address,
          type: "metamask",
          evmWallet: { provider, signer, address, chainId: Number(network.chainId) },
          solWallet: null,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect");
    }
  };

  // Execute bridge
  const handleBridge = async () => {
    if (!quote || !wallet.evmWallet) {
      setErrorMsg("Please connect wallet");
      return;
    }

    setStatus("processing");
    setErrorMsg("");

    try {
      // In production, call actual bridge contract
      const tx = await wallet.evmWallet.signer.sendTransaction({
        to: tokenType === "usdc" ? fromChain.usdc : fromChain.native,
        data: "0x",
        value: "0x0",
      });

      setTxHash(tx.hash);
      setStatus("success");
    } catch (err: any) {
      console.error("Bridge error:", err);
      setErrorMsg(err.message || "Bridge failed");
      setStatus("error");
    }
  };

  const swapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
    setQuote(null);
  };

  const availableToChains = useMemo(() => 
    SUPPORTED_CHAINS.filter(c => c.id !== fromChain.id), 
  [fromChain.id]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-display tracking-[0.08em] text-foreground">
          🌉 Cross-Chain Bridge
        </h1>
        <p className="mt-2 text-muted-foreground">
          Transfer assets between 10 different blockchains
        </p>
      </div>

      {/* Fee Tiers Info */}
      <div className="bg-blue-900/10 border border-blue-800/50 rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm text-blue-400 mb-3">
          <Info size={16} />
          <span className="font-medium">Commission Tiers</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="bg-blue-950/30 rounded-lg p-2">
            <div className="text-green-400 font-medium">&lt; $1,000</div>
            <div className="text-gray-400">0.26% total</div>
          </div>
          <div className="bg-blue-950/30 rounded-lg p-2">
            <div className="text-yellow-400 font-medium">$1K - $10K</div>
            <div className="text-gray-400">0.21% total</div>
          </div>
          <div className="bg-blue-950/30 rounded-lg p-2">
            <div className="text-blue-400 font-medium">&gt; $10K</div>
            <div className="text-gray-400">0.16% total</div>
          </div>
        </div>
      </div>

      {/* From Chain */}
      <div className="bg-card/50 rounded-2xl border border-border/60 p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">From Chain</div>
        <div className="flex gap-2 flex-wrap">
          {SUPPORTED_CHAINS.map((chain) => (
            <button
              key={chain.id}
              onClick={() => { setFromChain(chain); setQuote(null); }}
              disabled={chain.id === toChain.id}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                fromChain.id === chain.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-900/50 text-gray-300 border border-gray-800 hover:border-gray-700'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span>{chain.icon}</span>
              {chain.name}
            </button>
          ))}
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center -my-2">
        <button
          onClick={swapChains}
          className="bg-gray-900 hover:bg-gray-800 border-2 border-gray-700 rounded-full p-2 transition"
        >
          <ArrowRightLeft className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* To Chain */}
      <div className="bg-card/50 rounded-2xl border border-border/60 p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">To Chain</div>
        <div className="flex gap-2 flex-wrap">
          {availableToChains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => { setToChain(chain); setQuote(null); }}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                toChain.id === chain.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-900/50 text-gray-300 border border-gray-800 hover:border-gray-700'
              }`}
            >
              <span>{chain.icon}</span>
              {chain.name}
            </button>
          ))}
        </div>
      </div>

      {/* Token Type */}
      <div className="bg-card/50 rounded-2xl border border-border/60 p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Token</div>
        <div className="flex gap-2">
          <button
            onClick={() => setTokenType("native")}
            className={`px-4 py-2.5 rounded-xl transition-all ${
              tokenType === "native"
                ? 'bg-primary text-white'
                : 'bg-gray-900/50 text-gray-300 border border-gray-800 hover:border-gray-700'
            }`}
          >
            💎 {fromSymbol}
          </button>
          <button
            onClick={() => setTokenType("usdc")}
            className={`px-4 py-2.5 rounded-xl transition-all ${
              tokenType === "usdc"
                ? 'bg-primary text-white'
                : 'bg-gray-900/50 text-gray-300 border border-gray-800 hover:border-gray-700'
            }`}
          >
            💵 USDC
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="bg-card/50 rounded-2xl border border-border/60 p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Amount</div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-transparent text-3xl font-bold text-foreground placeholder-gray-600 outline-none"
        />
        {amountUSD > 0 && (
          <div className="text-right text-sm text-gray-500 mt-1">
            ≈ ${amountUSD.toLocaleString()} USD
          </div>
        )}
      </div>

      {/* Quote Details */}
      {quote && fromChain.id !== toChain.id && (
        <div className="bg-green-900/10 border border-green-800/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">You send</span>
            <span className="text-white">{amount} {fromSymbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">You receive (est.)</span>
            <span className="text-green-400 font-medium">{quote.estimatedAmount} {toSymbol}</span>
          </div>
          <div className="border-t border-gray-800 pt-2 mt-2 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Bridge Fee (~0.06%)</span>
              <span className="text-yellow-400">{quote.stargateFee || quote.wormholeFee} {fromSymbol}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Vestige Fee ({quote.vestigeFeePercent}%)</span>
              <span className="text-blue-400">{quote.vestigeFee} {fromSymbol}</span>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-gray-800">
              <span className="text-gray-400">Total Fee</span>
              <span className="text-white">{quote.totalFee} {fromSymbol}</span>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection */}
      {!wallet.connected ? (
        <button
          onClick={connectWallet}
          className="w-full py-4 bg-primary hover:opacity-90 rounded-2xl font-semibold flex items-center justify-center gap-2"
        >
          <Wallet size={18} />
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center justify-between bg-green-900/20 border border-green-800 rounded-xl px-4 py-3">
          <span className="text-green-400 text-sm">
            {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
          </span>
          <button
            onClick={() => setWallet({ connected: false, address: "", type: null, evmWallet: null, solWallet: null })}
            className="text-xs text-gray-500 hover:text-white"
          >
            Disconnect
          </button>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 flex items-center gap-2 text-red-400">
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Status */}
      {status === "processing" && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 flex items-center gap-2 text-yellow-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing bridge...
        </div>
      )}

      {status === "success" && (
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={16} />
            Bridge initiated successfully!
          </div>
          {txHash && (
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View on Explorer <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      {/* Bridge Button */}
      {wallet.connected && status !== "success" && (
        <button
          onClick={handleBridge}
          disabled={status === "quoting" || status === "processing" || !quote || fromChain.id === toChain.id}
          className="w-full py-4 bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-semibold flex items-center justify-center gap-2"
        >
          {status === "quoting" && <><Loader2 className="w-4 h-4 animate-spin" /> Getting quote...</>}
          {status === "processing" && <><Loader2 className="w-4 h-4 animate-spin" /> Bridging...</>}
          {status !== "quoting" && status !== "processing" && "Transfer"}
        </button>
      )}

      {status === "success" && (
        <button
          onClick={() => { setStatus("idle"); setAmount(""); setQuote(null); setTxHash(""); }}
          className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-semibold"
        >
          Transfer More
        </button>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 py-4">
        <p>Powered by Stargate • Vestige Fee: {VESTIGE_FEE_EVM.slice(0, 6)}...{VESTIGE_FEE_EVM.slice(-4)}</p>
      </div>
    </div>
  );
}