import React, { useState, useEffect } from 'react';
import { ArrowDownUp, Settings, RefreshCw, Loader2, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { useAccount } from 'wagmi';
import { getBestSwapQuote, SWAP_PROVIDERS, type SwapQuote, type SwapProvider } from '../lib/multiProviderSwap';

interface SwapAdvancedProps {
  onSwap?: (provider: string, fromToken: string, toToken: string, amount: string) => Promise<void>;
}

export const SwapAdvanced: React.FC<SwapAdvancedProps> = ({ onSwap }) => {
  const { address, isConnected, chainId } = useAccount();
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<SwapQuote[]>([]);
  const [bestQuote, setBestQuote] = useState<SwapQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState(1);
  const [availableProviders, setAvailableProviders] = useState<SwapProvider[]>([]);

  const POPULAR_TOKENS = ['USDC', 'USDT', 'ETH', 'BTC', 'ARB', 'OP', 'BNB', 'MATIC', 'SOL', 'DAI'];
  const SWAP_FEE = 0.003; // 0.3%

  // Filter providers by chain
  useEffect(() => {
    if (!chainId) return;

    const providers = SWAP_PROVIDERS.filter((p) => p.chains.includes(chainId));
    setAvailableProviders(providers);

    if (providers.length > 0 && !selectedProvider) {
      setSelectedProvider(providers[0].id);
    }
  }, [chainId, selectedProvider]);

  // Fetch quotes
  useEffect(() => {
    if (!amount || !fromToken || !toToken || !address) {
      setQuotes([]);
      setBestQuote(null);
      return;
    }

    const fetchQuotes = async () => {
      setIsLoading(true);
      try {
        const allQuotes = await getBestSwapQuote(
          chainId || 1,
          fromToken,
          toToken,
          amount,
          address,
          availableProviders.map((p) => p.id)
        );

        setQuotes(allQuotes);

        // Find best quote (highest output amount)
        const best = allQuotes.reduce((prev, current) =>
          parseFloat(current.toAmount) > parseFloat(prev.toAmount) ? current : prev
        );

        setBestQuote(best || null);
        if (best && !selectedProvider) {
          setSelectedProvider(best.provider.toLowerCase());
        }
      } catch (error) {
        console.error('Error fetching quotes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchQuotes, 500);
    return () => clearTimeout(timer);
  }, [amount, fromToken, toToken, address, chainId, availableProviders]);

  const handleSwap = async () => {
    if (!bestQuote || !address) return;

    try {
      setIsLoading(true);
      if (onSwap) {
        await onSwap(bestQuote.provider, fromToken, toToken, amount);
      }
      setAmount('');
    } finally {
      setIsLoading(false);
    }
  };

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-900 border border-gray-800 rounded-2xl text-center">
        <p className="text-gray-400">Connect your wallet to access advanced swaps</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Provider Selector */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-400 uppercase">Swap Provider</label>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {availableProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`p-3 rounded-lg border transition ${
                selectedProvider === provider.id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="text-center">
                <p className="font-semibold text-sm">{provider.name}</p>
                <p className="text-xs text-gray-500 mt-1">Fee: {provider.feePercentage}%</p>
              </div>
            </button>
          ))}
        </div>

        {showSettings && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <label className="block text-sm text-gray-400 mb-2">Slippage Tolerance</label>
            <div className="flex gap-2 mb-3">
              {[0.1, 0.5, 1.0].map((val) => (
                <button
                  key={val}
                  onClick={() => setSlippageTolerance(val)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    slippageTolerance === val ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
            <input
              type="number"
              value={slippageTolerance}
              onChange={(e) => setSlippageTolerance(parseFloat(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
              step="0.1"
              max="5"
            />
          </div>
        )}
      </div>

      {/* Swap Interface */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        {/* From Token */}
        <div className="bg-gray-900 rounded-xl p-4 mb-2 border border-gray-800">
          <label className="text-xs text-gray-500 font-semibold uppercase block mb-3">You Send</label>
          <div className="flex items-center justify-between gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-3xl font-bold text-white placeholder-gray-500 outline-none flex-1"
            />
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-lg outline-none cursor-pointer transition"
            >
              {POPULAR_TOKENS.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={swapTokens}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full p-2 transition"
          >
            <ArrowDownUp className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-900 rounded-xl p-4 mt-2 border border-gray-800">
          <label className="text-xs text-gray-500 font-semibold uppercase block mb-3">You Receive</label>
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={bestQuote ? bestQuote.toAmount : ''}
              readOnly
              placeholder="0.00"
              className="bg-transparent text-3xl font-bold text-white placeholder-gray-500 outline-none flex-1"
            />
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-lg outline-none cursor-pointer transition"
            >
              {POPULAR_TOKENS.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quote Details */}
      {bestQuote && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Best Price</span>
            <span className="text-white font-semibold">
              1 {fromToken} = {bestQuote.rate.toFixed(6)} {toToken}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Provider</span>
            <span className="text-blue-400 font-semibold">{bestQuote.provider}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price Impact</span>
            <span className={bestQuote.priceImpact > 2 ? 'text-red-400' : 'text-green-400'}>
              {bestQuote.priceImpact.toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
            <span className="text-gray-400">You Get</span>
            <span className="text-white font-semibold">
              {bestQuote.toAmount} {toToken}
            </span>
          </div>
        </div>
      )}

      {/* Quotes Comparison */}
      {quotes.length > 1 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            All Quotes
          </h3>
          <div className="space-y-2">
            {quotes.map((quote) => (
              <div
                key={quote.provider}
                className={`p-3 rounded-lg border transition cursor-pointer ${
                  selectedProvider === quote.provider.toLowerCase()
                    ? 'bg-blue-900/30 border-blue-600'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedProvider(quote.provider.toLowerCase())}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{quote.provider}</p>
                  <p className="text-white">
                    {quote.toAmount} {toToken}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">Impact: {quote.priceImpact.toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning */}
      {bestQuote && bestQuote.priceImpact > 5 && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 text-sm font-semibold">High Price Impact</p>
            <p className="text-red-300 text-xs">Consider reducing amount or changing providers</p>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!amount || !bestQuote || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Finding best rates...
          </>
        ) : (
          <>
            <TrendingUp className="w-5 h-5" />
            Swap {fromToken}
          </>
        )}
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        Powered by 1inch, OpenOcean, Matcha & Odos • Rates updated every 10s
      </p>
    </div>
  );
};
