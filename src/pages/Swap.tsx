import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowDown, Loader2, ArrowUpRight } from 'lucide-react';
import { useAccount, useChainId, useChains } from 'wagmi';
import { BrowserProvider } from 'ethers';
import SwapModal from '../components/SwapModal';

interface Token {
  symbol: string;
  name: string;
  logo?: string;
  balance?: string;
  price?: number;
}

const COMMON_TOKENS: Token[] = [
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'ARB', name: 'Arbitrum' },
  { symbol: 'OP', name: 'Optimism' },
];

export default function Swap() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { chains } = useChains();
  const chain = chains.find((c) => c.id === chainId);

  const [sellToken, setSellToken] = useState<Token>(COMMON_TOKENS[0]);
  const [buyToken, setBuyToken] = useState<Token>(COMMON_TOKENS[1]);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [fee, setFee] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate estimated buy amount
  useEffect(() => {
    if (!sellAmount) {
      setBuyAmount('');
      return;
    }

    // Placeholder calculation
    const estimated = (parseFloat(sellAmount) * 0.95).toFixed(6);
    setBuyAmount(estimated);

    // Calculate 0.3% fee
    const feeAmount = (parseFloat(sellAmount) * 0.003).toFixed(6);
    setFee(feeAmount);
  }, [sellAmount, sellToken, buyToken]);

  const handleSwap = () => {
    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    if (!sellAmount) {
      setError('Please enter an amount');
      return;
    }

    setShowModal(true);
  };

  const swapTokens = () => {
    const temp = sellToken;
    setSellToken(buyToken);
    setBuyToken(temp);
    setSellAmount('');
    setBuyAmount('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Swap</h1>
          <p className="text-gray-400">
            Trade tokens with 0.3% commission on all networks
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
          {/* Sell Token */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-3 block">You sell</label>
            <div className="flex gap-3 mb-3">
              <input
                type="number"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-gray-600"
              />
              <select
                value={sellToken.symbol}
                onChange={(e) => {
                  const token = COMMON_TOKENS.find(t => t.symbol === e.target.value);
                  if (token) setSellToken(token);
                }}
                className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white font-medium min-w-[120px]"
              >
                {COMMON_TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500">Balance: -- {sellToken.symbol}</p>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={swapTokens}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>

          {/* Buy Token */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-3 block">You receive</label>
            <div className="flex gap-3 mb-3">
              <input
                type="number"
                value={buyAmount}
                readOnly
                placeholder="0.00"
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-gray-600"
              />
              <select
                value={buyToken.symbol}
                onChange={(e) => {
                  const token = COMMON_TOKENS.find(t => t.symbol === e.target.value);
                  if (token) setBuyToken(token);
                }}
                className="bg-gray-800 border border-gray-700 rounded px-4 py-3 text-white font-medium min-w-[120px]"
              >
                {COMMON_TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500">Balance: -- {buyToken.symbol}</p>
          </div>

          {/* Details */}
          <div className="bg-gray-800 rounded p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price</span>
              <span className="font-medium">--</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Commission (0.3%)</span>
              <span className="font-medium">{fee} {sellToken.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Slippage tolerance</span>
              <select
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
              >
                <option value="0.1">0.1%</option>
                <option value="0.5">0.5%</option>
                <option value="1">1%</option>
                <option value="5">5%</option>
              </select>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-700 pt-3">
              <span className="text-gray-400">Network</span>
              <span className="font-medium">{chain?.name || 'Not connected'}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-800 rounded p-3 mb-6 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!isConnected || !sellAmount || isLoading}
            className={`w-full py-3 rounded font-medium transition flex items-center justify-center gap-2 ${
              !isConnected || !sellAmount || isLoading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {!isConnected ? 'Connect Wallet' : 'Review & Swap'}
          </button>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Commission</p>
            <p className="text-xl font-bold">0.3%</p>
          </div>
          <div className="bg-gray-900 rounded p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">Supported Networks</p>
            <p className="text-xl font-bold">8</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SwapModal
          sellToken={sellToken}
          buyToken={buyToken}
          sellAmount={sellAmount}
          buyAmount={buyAmount}
          fee={fee}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
