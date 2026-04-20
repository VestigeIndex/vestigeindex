import React, { useState, useEffect } from 'react';
import { ArrowDownUp, Settings, RefreshCw, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface Token {
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  address?: string;
  chainId?: number;
}

interface SwapPrice {
  fromAmount: string;
  toAmount: string;
  rate: number;
  impact: number;
  fee: string;
  estimatedTime: number;
}

interface SwapInterfaceProps {
  onSwap?: (from: Token, to: Token, amount: string) => Promise<void>;
}

const POPULAR_TOKENS: Token[] = [
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, logo: '/logos/crypto/usdc.svg' },
  { symbol: 'USDT', name: 'Tether', decimals: 6, logo: '/logos/crypto/usdt.svg' },
  { symbol: 'ETH', name: 'Ethereum', decimals: 18, logo: '/logos/crypto/eth.svg' },
  { symbol: 'BNB', name: 'Binance Coin', decimals: 18, logo: '/logos/crypto/bnb.svg' },
  { symbol: 'MATIC', name: 'Polygon', decimals: 18, logo: '/logos/crypto/matic.svg' },
  { symbol: 'SOL', name: 'Solana', decimals: 9, logo: '/logos/crypto/sol.svg' },
  { symbol: 'ARB', name: 'Arbitrum', decimals: 18, logo: '/logos/crypto/arb.svg' },
  { symbol: 'BTC', name: 'Bitcoin', decimals: 8, logo: '/logos/crypto/btc.svg' },
];

export const SwapInterface: React.FC<SwapInterfaceProps> = ({ onSwap }) => {
  const [fromToken, setFromToken] = useState<Token>(POPULAR_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(POPULAR_TOKENS[2]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [price, setPrice] = useState<SwapPrice | null>(null);

  const SWAP_FEE = 0.003; // 0.3%

  // Mock price calculation
  useEffect(() => {
    if (!fromAmount) {
      setToAmount('');
      setPrice(null);
      return;
    }

    const mockRate = 1.05; // Mock exchange rate
    const fee = parseFloat(fromAmount) * SWAP_FEE;
    const toAmountCalc = (parseFloat(fromAmount) - fee) * mockRate;

    setToAmount(toAmountCalc.toFixed(2));
    setPrice({
      fromAmount,
      toAmount: toAmountCalc.toFixed(2),
      rate: mockRate,
      impact: 0.15,
      fee: fee.toFixed(6),
      estimatedTime: 30,
    });
  }, [fromAmount]);

  const handleSwap = async () => {
    if (!fromAmount || !price) return;

    try {
      setIsLoading(true);
      if (onSwap) {
        await onSwap(fromToken, toToken, fromAmount);
      }
      // Reset form
      setFromAmount('');
      setToAmount('');
    } finally {
      setIsLoading(false);
    }
  };

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const TokenInput = ({
    label,
    token,
    amount,
    onChange,
    onTokenChange,
    disabled,
  }: {
    label: string;
    token: Token;
    amount: string;
    onChange: (val: string) => void;
    onTokenChange: (tok: Token) => void;
    disabled?: boolean;
  }) => (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <label className="text-xs text-gray-500 font-semibold uppercase">{label}</label>

      <div className="flex items-center justify-between mt-2">
        {/* Input */}
        <input
          type="number"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          disabled={disabled}
          className="bg-transparent text-2xl font-bold text-white placeholder-gray-500 outline-none w-full disabled:opacity-50"
        />

        {/* Token Selector */}
        <select
          value={token.symbol}
          onChange={(e) => {
            const selected = POPULAR_TOKENS.find((t) => t.symbol === e.target.value);
            if (selected) onTokenChange(selected);
          }}
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-lg outline-none cursor-pointer transition"
        >
          {POPULAR_TOKENS.map((t) => (
            <option key={t.symbol} value={t.symbol}>
              {t.symbol}
            </option>
          ))}
        </select>
      </div>

      {/* Balance */}
      <div className="text-xs text-gray-500 mt-2">Balance: 0.00 {token.symbol}</div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Swap</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
          <label className="block text-sm text-gray-400 mb-2">Slippage Tolerance</label>
          <div className="flex gap-2 mb-2">
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

      {/* Swap Card */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 mb-4">
        {/* From Token */}
        <TokenInput
          label="You send"
          token={fromToken}
          amount={fromAmount}
          onChange={setFromAmount}
          onTokenChange={setFromToken}
        />

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
        <div className="mt-4">
          <TokenInput
            label="You receive"
            token={toToken}
            amount={toAmount}
            onChange={() => {}} // Disabled
            onTokenChange={setToToken}
            disabled
          />
        </div>
      </div>

      {/* Price Info */}
      {price && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price</span>
            <span className="text-white font-semibold">
              1 {fromToken.symbol} = {price.rate.toFixed(4)} {toToken.symbol}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price Impact</span>
            <span className={price.impact > 1 ? 'text-red-400' : 'text-green-400'}>
              {price.impact.toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Swap Fee (0.3%)</span>
            <span className="text-white">{price.fee} {fromToken.symbol}</span>
          </div>

          <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
            <span className="text-gray-400">You get</span>
            <span className="text-white font-semibold text-lg">
              {price.toAmount} {toToken.symbol}
            </span>
          </div>
        </div>
      )}

      {/* Warnings */}
      {price && price.impact > 5 && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-4 flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 text-sm font-semibold">High Price Impact</p>
            <p className="text-red-300 text-xs">This trade will move the market price</p>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={!fromAmount || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Swapping...
          </>
        ) : (
          <>
            <TrendingUp className="w-5 h-5" />
            Swap {fromToken.symbol}
          </>
        )}
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Network fees and execution times depend on network congestion
      </p>
    </div>
  );
};
