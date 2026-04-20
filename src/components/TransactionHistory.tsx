import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, RefreshCw, CheckCircle2, Clock, XCircle, Download, Send, ArrowLeftRight } from 'lucide-react';
import { useAccount } from 'wagmi';

interface Transaction {
  id: string;
  type: 'swap' | 'bridge' | 'send' | 'receive';
  from: {
    symbol: string;
    amount: string;
    address: string;
    logo?: string;
  };
  to: {
    symbol: string;
    amount: string;
    address: string;
    logo?: string;
  };
  status: 'success' | 'pending' | 'failed';
  timestamp: number;
  chainId: number;
  hash: string;
  fee?: string;
  feeUSD?: string;
  slippage?: number;
  provider?: string;
}

interface TransactionHistoryProps {
  onRefresh?: () => Promise<void>;
}

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  56: 'BSC',
  137: 'Polygon',
  42161: 'Arbitrum',
  10: 'Optimism',
  8453: 'Base',
  25: 'Cronos',
  501: 'Solana',
};

const EXPLORER_URLS: Record<number, string> = {
  1: 'https://etherscan.io/tx/',
  56: 'https://bscscan.com/tx/',
  137: 'https://polygonscan.com/tx/',
  42161: 'https://arbiscan.io/tx/',
  10: 'https://optimistic.etherscan.io/tx/',
  8453: 'https://basescan.org/tx/',
  25: 'https://cronoscan.com/tx/',
  501: 'https://solscan.io/tx/',
};

const getTypeIcon = (type: Transaction['type']) => {
  switch (type) {
    case 'swap':
      return <ArrowLeftRight className="w-4 h-4" />;
    case 'bridge':
      return <ArrowLeftRight className="w-4 h-4" />;
    case 'send':
      return <Send className="w-4 h-4" />;
    case 'receive':
      return <Download className="w-4 h-4" />;
  }
};

const getStatusIcon = (status: Transaction['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    case 'pending':
      return <Clock className="w-5 h-5 text-yellow-400 animate-spin" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-red-400" />;
  }
};

const getStatusColor = (status: Transaction['status']) => {
  switch (status) {
    case 'success':
      return 'bg-green-900/20 border-green-500/30';
    case 'pending':
      return 'bg-yellow-900/20 border-yellow-500/30';
    case 'failed':
      return 'bg-red-900/20 border-red-500/30';
  }
};

const formatTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
};

const truncateHash = (hash: string): string => {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

// Mock transactions - replace with real blockchain data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'swap',
    from: { symbol: 'USDC', amount: '1,000', address: '0x...' },
    to: { symbol: 'ETH', amount: '0.5', address: '0x...' },
    status: 'success',
    timestamp: Date.now() - 300000,
    chainId: 1,
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    fee: '0.05',
    feeUSD: '$100',
    slippage: 0.5,
    provider: '1inch',
  },
  {
    id: '2',
    type: 'bridge',
    from: { symbol: 'ETH', amount: '1', address: '0x...' },
    to: { symbol: 'ETH', amount: '0.998', address: '0x...' },
    status: 'pending',
    timestamp: Date.now() - 600000,
    chainId: 1,
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    fee: '0.002',
    feeUSD: '$4',
    provider: 'Stargate',
  },
  {
    id: '3',
    type: 'receive',
    from: { symbol: 'ARB', amount: '100', address: '0x...' },
    to: { symbol: 'ARB', amount: '100', address: '0x...' },
    status: 'success',
    timestamp: Date.now() - 86400000,
    chainId: 42161,
    hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    fee: '0.001',
    feeUSD: '$0.10',
  },
];

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onRefresh }) => {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'swap' | 'bridge' | 'send' | 'receive'>('all');

  useEffect(() => {
    if (!isConnected) {
      setTransactions([]);
      return;
    }

    // Load mock data - replace with real blockchain queries
    setTransactions(MOCK_TRANSACTIONS);
  }, [isConnected, address]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      // In production, fetch from blockchain here
      setTransactions(MOCK_TRANSACTIONS);
    } catch (err) {
      setError('Failed to refresh transactions');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">Connect your wallet to view transaction history</p>
      </div>
    );
  }

  const filteredTransactions =
    filter === 'all' ? transactions : transactions.filter((tx) => tx.type === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Transaction History</h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 hover:bg-gray-800 rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'swap', 'bridge', 'send', 'receive'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <a
              key={tx.id}
              href={`${EXPLORER_URLS[tx.chainId]}${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`block p-4 border rounded-lg transition hover:border-blue-500/50 cursor-pointer ${getStatusColor(
                tx.status
              )}`}
            >
              <div className="flex items-center justify-between">
                {/* Left - Type Icon & Details */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                    {getTypeIcon(tx.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white capitalize">
                      {tx.type === 'swap' ? 'Swap' : tx.type === 'bridge' ? 'Bridge' : tx.type === 'send' ? 'Send' : 'Receive'}
                    </p>
                    <div className="text-sm text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>{truncateHash(tx.hash)}</span>
                      <span>•</span>
                      <span>{CHAIN_NAMES[tx.chainId]}</span>
                      {tx.provider && (
                        <>
                          <span>•</span>
                          <span>{tx.provider}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right - Amount & Status */}
                <div className="text-right ml-4">
                  <p className="font-semibold text-white">
                    {tx.from.amount} {tx.from.symbol} → {tx.to.amount} {tx.to.symbol}
                  </p>
                  <div className="text-sm text-gray-400 mt-0.5">
                    {tx.fee && <span>{tx.fee} {tx.from.symbol}</span>}
                    {tx.feeUSD && <span> ({tx.feeUSD})</span>}
                  </div>
                </div>

                {/* Status Icon */}
                <div className="ml-4 flex-shrink-0">{getStatusIcon(tx.status)}</div>
              </div>

              {/* Time */}
              <div className="text-xs text-gray-500 mt-2">{formatTime(tx.timestamp)}</div>
            </a>
          ))
        )}
      </div>

      {/* Stats */}
      {filteredTransactions.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Transactions</p>
              <p className="text-lg font-bold text-white mt-1">{filteredTransactions.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Success Rate</p>
              <p className="text-lg font-bold text-green-400 mt-1">
                {Math.round(
                  (filteredTransactions.filter((tx) => tx.status === 'success').length /
                    filteredTransactions.length) *
                    100
                )}
                %
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Fees Paid</p>
              <p className="text-lg font-bold text-white mt-1">
                ${filteredTransactions
                  .reduce((sum, tx) => {
                    const feeStr = tx.feeUSD?.replace('$', '').replace(',', '') || '0';
                    return sum + parseFloat(feeStr);
                  }, 0)
                  .toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Last Transaction</p>
              <p className="text-lg font-bold text-white mt-1">{formatTime(filteredTransactions[0].timestamp)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
