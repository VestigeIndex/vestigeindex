import React, { useState, useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { X, ArrowUpDown, Loader2, ExternalLink, Search, ChevronDown, AlertTriangle, Zap, Wallet, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { getSwapQuote, getNetworkName } from "../lib/swapService";
import { parseUnits, formatUnits, BrowserProvider, Contract } from "ethers";

const BINANCE_API = "https://api.binance.com/api/v3";

const NETWORKS = [
  { id: 1, name: "Ethereum", symbol: "ETH", rpc: "https://eth.llamarpc.com" },
  { id: 56, name: "BNB Chain", symbol: "BNB", rpc: "https://bsc-dataseed.binance.org" },
  { id: 137, name: "Polygon", symbol: "MATIC", rpc: "https://polygon.llamarpc.com" },
  { id: 42161, name: "Arbitrum", symbol: "ARB", rpc: "https://arb1.arbitrum.io/rpc" },
  { id: 8453, name: "Base", symbol: "ETH", rpc: "https://mainnet.base.org" },
];

const TOKEN_LIST: Record<number, Array<{address: string, symbol: string, name: string, decimals: number, logo?: string}>> = {
  1: [
    { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "ETH", name: "Ethereum", decimals: 18, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", name: "Wrapped Bitcoin", decimals: 8, logo: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png" },
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD", decimals: 6, logo: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
    { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", decimals: 6, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
    { address: "0x514910771AF9Ca656af840dff83E8264EcF986DA", symbol: "LINK", name: "Chainlink", decimals: 18, logo: "https://cryptologos.cc/logos/chainlink-link-logo.png" },
    { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI", name: "Uniswap", decimals: 18, logo: "https://cryptologos.cc/logos/uniswap-uni-logo.png" },
    { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", symbol: "AAVE", name: "Aave", decimals: 18, logo: "https://cryptologos.cc/logos/aave-aave-logo.png" },
    { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", name: "Dai", decimals: 18, logo: "https://cryptologos.cc/logos/dai-dai-logo.png" },
  ],
  56: [
    { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", symbol: "BNB", name: "BNB", decimals: 18, logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png" },
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", name: "Tether USD", decimals: 18, logo: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", name: "USD Coin", decimals: 18, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
    { address: "0x0E09FaBB73Bd3Ade0a17ECC321d24a02e9aF8", symbol: "CAKE", name: "PancakeSwap", decimals: 18, logo: "https://cryptologos.cc/logos/pancakeswap-cake-logo.png" },
  ],
  137: [
    { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "MATIC", name: "Polygon", decimals: 18, logo: "https://cryptologos.cc/logos/polygon-matic-logo.png" },
    { address: "0x0d500B1d8E8eF31E21C73d9a0d89a4E96932E91C", symbol: "WMATIC", name: "Wrapped Matic", decimals: 18, logo: "https://cryptologos.cc/logos/polygon-matic-logo.png" },
    { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC", name: "USD Coin", decimals: 6, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
    { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", name: "Tether USD", decimals: 6, logo: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
  ],
  42161: [
    { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "ETH", name: "Ethereum", decimals: 18, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", symbol: "USDC", name: "USD Coin", decimals: 6, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
  ],
  8453: [
    { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", symbol: "ETH", name: "Ethereum", decimals: 18, logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
    { address: "0x4EED0fa8dE12D5a86517f214C2f11586Ba2ED88D", symbol: "USDC", name: "USDC", decimals: 6, logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
  ],
};

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
}

async function fetchBinancePrice(fromSymbol: string, toSymbol: string): Promise<number | null> {
  const from = fromSymbol.replace(/^(W|N)/, '').toUpperCase();
  const to = toSymbol.replace(/^(W|N)/, '').toUpperCase();
  
  try {
    const res = await fetch(`${BINANCE_API}/ticker/price?symbol=${from}${to}`);
    if (res.ok) {
      const data = await res.json();
      return parseFloat(data.price);
    }
  } catch {}
  
  // Try via USDT
  if (from !== 'USDT' && to !== 'USDT') {
    try {
      const [fromRes, toRes] = await Promise.all([
        fetch(`${BINANCE_API}/ticker/price?symbol=${from}USDT`),
        fetch(`${BINANCE_API}/ticker/price?symbol=${to}USDT`)
      ]);
      if (fromRes.ok && toRes.ok) {
        const [fromData, toData] = await Promise.all([fromRes.json(), toRes.json()]);
        const fromPrice = parseFloat(fromData.price);
        const toPrice = parseFloat(toData.price);
        if (fromPrice && toPrice) return fromPrice / toPrice;
      }
    } catch {}
  }
  return null;
}

function TokenSelector({ 
  tokens, 
  selected, 
  onSelect, 
  label 
}: { 
  tokens: Token[], 
  selected: Token | null, 
  onSelect: (token: Token) => void,
  label: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  
  const filtered = useMemo(() => {
    if (!search) return tokens;
    const s = search.toLowerCase();
    return tokens.filter(t => t.symbol.toLowerCase().includes(s) || t.name.toLowerCase().includes(s));
  }, [tokens, search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <button onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-2.5 hover:border-gray-600 transition">
        {selected ? (
          <div className="flex items-center gap-2">
            {selected.logo && <img src={selected.logo} alt={selected.symbol} className="w-5 h-5 rounded-full" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />}
            <span className="font-medium text-white">{selected.symbol}</span>
          </div>
        ) : <span className="text-gray-400">Select token</span>}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-8 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none" />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {filtered.map((token, i) => (
              <button key={i} onClick={() => { onSelect(token); setIsOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 transition ${selected?.address === token.address ? 'bg-gray-800' : ''}`}>
                {token.logo && <img src={token.logo} alt={token.symbol} className="w-5 h-5 rounded-full" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />}
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{token.symbol}</div>
                  <div className="text-xs text-gray-500">{token.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NetworkButton({ chainId, onClick, currentChainId }: { chainId: number, onClick: () => void, currentChainId: number }) {
  const net = NETWORKS.find(n => n.id === chainId)!;
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${chainId === currentChainId ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
      {net.symbol}
    </button>
  );
}

interface SwapModalProps {
  coin?: { name: string; symbol: string; price?: number };
  onClose: () => void;
}

export default function SwapModal({ coin, onClose }: SwapModalProps) {
  const { wallet, setWallet } = useApp();
  
  const [selectedChainId, setSelectedChainId] = useState<number>(1);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [status, setStatus] = useState<"idle" | "connecting" | "quoting" | "processing" | "success" | "error">("idle");
  const [quote, setQuote] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);
  const quoteTimer = useRef<NodeJS.Timeout | null>(null);

  const chainId = selectedChainId;
  const tokens = useMemo(() => TOKEN_LIST[chainId] || [], [chainId]);

  // Initialize tokens
  useEffect(() => {
    if (!fromToken) {
      const eth = tokens.find(t => t.symbol === 'ETH');
      const usdt = tokens.find(t => t.symbol === 'USDT');
      if (eth) setFromToken(eth);
      if (usdt && eth?.address !== usdt.address) setToToken(usdt);
    }
  }, [tokens]);

  // Fetch market price
  useEffect(() => {
    if (!fromToken || !toToken) return;
    let mounted = true;
    const fetchPrice = async () => {
      const price = await fetchBinancePrice(fromToken.symbol, toToken.symbol);
      if (mounted) setMarketPrice(price);
    };
    fetchPrice();
    return () => { mounted = false; };
  }, [fromToken, toToken]);

  // Compare prices
  useEffect(() => {
    if (!marketPrice || !estimatedOutput || !amount) {
      setPriceWarning(null);
      return;
    }
    const swapPrice = estimatedOutput / parseFloat(amount);
    const diff = Math.abs((swapPrice - marketPrice) / marketPrice) * 100;
    if (diff > 2) setPriceWarning(`Price difference: ${diff.toFixed(1)}%`);
    else setPriceWarning(null);
  }, [marketPrice, estimatedOutput, amount]);

  // Quote fetching with debounce
  useEffect(() => {
    if (!fromToken || !toToken || !amount || parseFloat(amount) <= 0 || !wallet.connected) {
      setQuote(null);
      return;
    }

    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(async () => {
      setStatus("quoting");
      setErrorMsg("");
      try {
        const amountWei = parseUnits(amount, fromToken.decimals).toString();
        const result = await getSwapQuote(
          chainId,
          fromToken.address,
          toToken.address,
          amountWei,
          wallet.address,
          slippage / 100
        );
        setQuote(result);
        setStatus("idle");
      } catch (err: any) {
        console.error("Quote error:", err);
        setErrorMsg(err.message || "Failed to get quote");
        setStatus("idle");
      }
    }, 800);

    return () => { if (quoteTimer.current) clearTimeout(quoteTimer.current); };
  }, [fromToken, toToken, amount, chainId, wallet.address, slippage, wallet.connected]);

  const estimatedOutput = useMemo(() => {
    if (!quote?.quote) return null;
    const outAmount = quote.quote.minOutAmount || quote.quote.to;
    return parseFloat(outAmount?.toString() || "0") / Math.pow(10, toToken?.decimals || 18);
  }, [quote, toToken]);

  const priceImpact = quote?.quote?.price_impact || "0%";
  const gasEstimate = quote?.quote?.estimatedGas || 0;

  // Connect MetaMask
  const connectMetaMask = async () => {
    setStatus("connecting");
    setErrorMsg("");
    try {
      if (!window.ethereum) {
        throw new Error("No wallet found. Install MetaMask.");
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      if (accounts.length > 0) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        const activeChainId = Number(network.chainId);
        
        setWallet({
          connected: true,
          address,
          type: "metamask",
          evmWallet: { provider, signer, address, chainId: activeChainId },
          solWallet: null,
        });
      }
      setStatus("idle");
    } catch (err: any) {
      console.error("MetaMask error:", err);
      setErrorMsg(err.message || "Failed to connect");
      setStatus("idle");
    }
  };

  // Execute swap
  const handleSwap = async () => {
    if (!quote || !wallet.evmWallet) {
      setErrorMsg("Please connect wallet first");
      return;
    }

    setStatus("processing");
    setErrorMsg("");

    try {
      const tx = await wallet.evmWallet.signer.sendTransaction({
        to: quote.quote.to,
        data: quote.quote.data,
        value: quote.quote.value || "0"
      });

      setTxHash(tx.hash);
      setStatus("success");
    } catch (err: any) {
      console.error("Swap error:", err);
      setErrorMsg(err.message || "Swap failed");
      setStatus("error");
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setQuote(null);
  };

  const handleNetworkChange = (newChainId: number) => {
    setSelectedChainId(newChainId);
    setFromToken(null);
    setToToken(null);
    setQuote(null);
    setMarketPrice(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Swap</h2>
          <div className="flex items-center gap-2">
            {NETWORKS.map(n => (
              <NetworkButton key={n.id} chainId={n.id} currentChainId={chainId} onClick={() => handleNetworkChange(n.id)} />
            ))}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* Slippage */}
        <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-400">Slippage</span>
          <div className="flex gap-1">
            {[0.5, 1, 2, 3].map(opt => (
              <button key={opt} onClick={() => setSlippage(opt)}
                className={`px-2 py-1 rounded text-xs ${slippage === opt ? 'bg-primary text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {opt}%
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Wallet */}
          {!wallet.connected ? (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-800 text-center">
              <Wallet className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm mb-3">Connect your wallet to swap</p>
              <button onClick={connectMetaMask} disabled={status === "connecting"}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 disabled:opacity-50 px-4 py-2.5 rounded-lg text-white font-medium">
                {status === "connecting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                Connect Wallet
              </button>
              {errorMsg && <p className="text-red-400 text-xs mt-2">{errorMsg}</p>}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-green-900/20 border border-green-800 rounded-lg px-3 py-2">
              <span className="text-green-400 text-sm">Connected: {wallet.address.slice(0,6)}...{wallet.address.slice(-4)}</span>
              <button onClick={() => setWallet({ connected: false, address: "", type: null, evmWallet: null, solWallet: null })} 
                className="text-gray-400 hover:text-white text-xs">Disconnect</button>
            </div>
          )}

          {/* From */}
          <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-800">
            <TokenSelector tokens={tokens} selected={fromToken} onSelect={setFromToken} label="From" />
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 outline-none mt-2" />
          </div>

          {/* Swap button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button onClick={swapTokens} className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 rounded-full p-2 transition">
              <ArrowUpDown className="w-4 h-4 text-primary" />
            </button>
          </div>

          {/* To */}
          <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-800">
            <TokenSelector tokens={tokens} selected={toToken} onSelect={setToToken} label="To" />
            <div className="text-2xl font-bold text-white mt-2">
              {estimatedOutput ? estimatedOutput.toFixed(6) : "—"}
              <span className="text-sm text-gray-500 ml-2">{toToken?.symbol}</span>
            </div>
          </div>

          {/* Market vs Swap Price */}
          {marketPrice && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>📊 Market Price</span>
                <span className="text-white">1 {fromToken?.symbol} = {marketPrice.toFixed(6)} {toToken?.symbol}</span>
              </div>
              {quote && (
                <div className="flex justify-between text-gray-400">
                  <span>🔄 Swap Price</span>
                  <span className="text-primary">1 {fromToken?.symbol} = {(estimatedOutput && amount ? estimatedOutput / parseFloat(amount) : 0).toFixed(6)} {toToken?.symbol}</span>
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          {priceWarning && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3 flex items-center gap-2 text-yellow-400 text-sm">
              <AlertTriangle size={16} /> {priceWarning}
            </div>
          )}

          {/* Quote Details */}
          {quote && (
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Price Impact</span>
                <span className={parseFloat(priceImpact) > 5 ? "text-red-400" : parseFloat(priceImpact) > 3 ? "text-yellow-400" : "text-white"}>{priceImpact}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Provider</span>
                <span className="text-white">{quote.provider || "OpenOcean"}</span>
              </div>
            </div>
          )}

          {/* Status */}
          {status === 'processing' && (
            <div className="flex items-center gap-2 text-yellow-400"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</div>
          )}
          {status === 'success' && txHash && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={16} /> Swap successful!
              <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">View <ExternalLink size={12} /></a>
            </div>
          )}
          {errorMsg && status !== 'processing' && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">{errorMsg}</div>
          )}

          {/* Swap Button */}
          {wallet.connected && status !== 'success' && (
            <button onClick={handleSwap} disabled={status === "quoting" || status === "processing" || !quote}
              className="w-full bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
              {status === "quoting" && <><Loader2 className="w-4 h-4 animate-spin" /> Getting quote...</>}
              {status === "processing" && <><Loader2 className="w-4 h-4 animate-spin" /> Swapping...</>}
              {status !== "quoting" && status !== "processing" && (quote ? <><Zap size={16} /> Swap</> : "Enter amount")}
            </button>
          )}

          {status === 'success' && (
            <button onClick={() => { setStatus("idle"); setAmount(""); setQuote(null); setTxHash(""); }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition">
              Swap More
            </button>
          )}
        </div>

        <div className="px-4 pb-4 text-center text-xs text-gray-500">
          Powered by OpenOcean • {getNetworkName(chainId)}
        </div>
      </div>
    </div>
  );
}