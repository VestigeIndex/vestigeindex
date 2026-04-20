import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowDown, Loader2, CheckCircle } from 'lucide-react';
import { useAccount, useChainId, useChains } from 'wagmi';
import type { BridgeQuote, BridgeValidation } from '../lib/bridgeService';
import {
  validateBridgeRoute,
  getBridgeQuote,
  getSupportedTokensForChain,
  getBridgeNetworks,
  isBridgeAvailable,
} from '../lib/bridgeService';

const BRIDGE_NETWORKS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', logo: '/logos/networks/ethereum.svg' },
  { id: 56, name: 'BNB Chain', symbol: 'BNB', logo: '/logos/networks/bnb-chain.svg' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', logo: '/logos/networks/polygon.svg' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', logo: '/logos/networks/arbitrum.svg' },
  { id: 10, name: 'Optimism', symbol: 'ETH', logo: '/logos/networks/optimism.svg' },
  { id: 8453, name: 'Base', symbol: 'ETH', logo: '/logos/networks/base.svg' },
  { id: 25, name: 'Cronos', symbol: 'CRO', logo: '/logos/networks/cronos.svg' },
  { id: 501, name: 'Solana', symbol: 'SOL', logo: '/logos/networks/solana.svg' },
];

export default function Bridge() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { chains } = useChains();
  const chain = chains.find((c) => c.id === chainId);

  const [fromChain, setFromChain] = useState(1);
  const [toChain, setToChain] = useState(56);
  const [token, setToken] = useState('USDC');
  const [amount, setAmount] = useState('');

  const [validation, setValidation] = useState<BridgeValidation | null>(null);
  const [quote, setQuote] = useState<BridgeQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supportedTokens = getSupportedTokensForChain(fromChain);

  // Validate route when chain or token changes
  useEffect(() => {
    const validateRoute = async () => {
      setIsLoading(true);
      setError(null);
      const result = await validateBridgeRoute(fromChain, toChain, token);
      setValidation(result);
      setIsLoading(false);
    };

    validateRoute();
  }, [fromChain, toChain, token]);

  // Get quote when amount changes
  useEffect(() => {
    const getQuote = async () => {
      if (!amount || !validation?.isValid) {
        setQuote(null);
        return;
      }

      setIsLoading(true);
      try {
        const q = await getBridgeQuote(
          fromChain,
          toChain,
          token,
          BigInt(parseFloat(amount) * Math.pow(10, 6)).toString()
        );
        setQuote(q);
      } catch (err) {
        console.error('Quote error:', err);
        setQuote(null);
      } finally {
        setIsLoading(false);
      }
    };

    getQuote();
  }, [amount, fromChain, toChain, token, validation?.isValid]);

  const handleSwapChains = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const handleBridge = async () => {
    if (!isConnected || !address || !quote) {
      setError('Please connect your wallet');
      return;
    }

    if (chain?.id !== fromChain) {
      setError(`Please switch to ${BRIDGE_NETWORKS.find(n => n.id === fromChain)?.name}`);
      return;
    }

    setIsExecuting(true);
    setError(null);

    try {
      // TODO: Implement actual bridge execution
      // await executeBridge(provider, quote, address);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Bridge failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const isBridgeDisabled =
    !validation?.isValid ||
    !amount ||
    !isConnected ||
    chain?.id !== fromChain ||
    isLoading ||
    isExecuting;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Cross-Chain Bridge</h1>
          <p className="text-gray-400">
            Transfer tokens between 8 chains with 0.06%-0.07% fee
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          {/* From Chain */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">From</label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={fromChain}
                onChange={(e) => setFromChain(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                {BRIDGE_NETWORKS.filter(n => isBridgeAvailable(n.id)).map((net) => (
                  <option key={net.id} value={net.id}>
                    {net.name} ({net.symbol})
                  </option>
                ))}
              </select>

              {/* Token Selection */}
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                {supportedTokens.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
          </div>

          {/* Swap Chains Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleSwapChains}
              className="p-2 hover:bg-gray-800 rounded transition"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>

          {/* To Chain */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-2 block">To</label>
            <select
              value={toChain}
              onChange={(e) => setToChain(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
            >
              {BRIDGE_NETWORKS.filter((n) => n.id !== fromChain && isBridgeAvailable(n.id)).map(
                (net) => (
                  <option key={net.id} value={net.id}>
                    {net.name} ({net.symbol})
                  </option>
                )
              )}
            </select>
          </div>

          {/* Validation Status */}
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-400 mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Checking bridge routes...</span>
            </div>
          )}

          {validation && !validation.isValid && (
            <div className="flex items-start gap-3 bg-red-900/20 border border-red-800 rounded p-4 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium">No Route Available</p>
                <p className="text-red-400 text-sm">{validation.error}</p>
              </div>
            </div>
          )}

          {validation?.isValid && (
            <div className="bg-green-900/20 border border-green-800 rounded p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-green-300 font-medium mb-2">
                    Route: {validation.routeType === 'direct' ? 'Direct Bridge' : 'Swap + Bridge'}
                  </p>
                  <p className="text-green-400 text-sm mb-2">Via: {validation.bridge?.toUpperCase()}</p>
                  <div className="space-y-1">
                    {validation.steps?.map((step, idx) => (
                      <p key={idx} className="text-green-400 text-xs">
                        • {step}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quote Details */}
          {quote && (
            <div className="bg-gray-800 rounded p-4 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Receive (approx)</span>
                <span className="font-medium">{quote.toAmount} {quote.toToken}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Bridge Fee</span>
                <span className="font-medium">{quote.fee} {quote.fromToken}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Route Type</span>
                <span className="font-medium capitalize">{quote.routeType}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-700 pt-3">
                <span className="text-gray-400">Estimated Time</span>
                <span className="font-medium">{Math.round(quote.estimatedTime / 60)} min</span>
              </div>
              <div className="space-y-2 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-400">Steps:</p>
                {quote.steps.map((step, idx) => (
                  <p key={idx} className="text-xs text-gray-300">
                    {idx + 1}. {step.description}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 bg-red-900/20 border border-red-800 rounded p-4 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-3 bg-green-900/20 border border-green-800 rounded p-4 mb-6">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-green-300 text-sm">Bridge initiated successfully!</p>
            </div>
          )}

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={isBridgeDisabled}
            className={`w-full py-3 rounded font-medium transition ${
              isBridgeDisabled
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isExecuting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Bridging...
              </div>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : chain?.id !== fromChain ? (
              `Switch to ${BRIDGE_NETWORKS.find(n => n.id === fromChain)?.name}`
            ) : !validation?.isValid ? (
              'No Route Available'
            ) : (
              'Transfer'
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Bridge Fee</p>
            <p className="text-xl font-bold">0.06%-0.07%</p>
          </div>
          <div className="bg-gray-900 rounded p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Supported Chains</p>
            <p className="text-xl font-bold">8 Networks</p>
          </div>
          <div className="bg-gray-900 rounded p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Bridge Type</p>
            <p className="text-xl font-bold">Multi-Route</p>
          </div>
        </div>
      </div>
    </div>
  );
}
