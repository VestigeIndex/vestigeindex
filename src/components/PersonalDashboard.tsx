import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Download, Upload, TrendingUp, Wallet } from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  priceChange24h: number;
  logo?: string;
}

interface Transaction {
  id: string;
  type: 'swap' | 'bridge' | 'send' | 'receive';
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  hash: string;
  chainId: number;
  fee?: string;
}

export const PersonalDashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState('0.00');
  const [balanceChange24h, setBalanceChange24h] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'transactions'>('overview');
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with real API calls
  useEffect(() => {
    if (!isConnected || !address) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setAssets([
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: '2.5',
          usdValue: '$5,250.00',
          priceChange24h: 2.3,
          logo: '/logos/crypto/eth-pro.svg',
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          balance: '10,000',
          usdValue: '$10,000.00',
          priceChange24h: 0.1,
          logo: '/logos/crypto/usdc-pro.svg',
        },
        {
          symbol: 'ARB',
          name: 'Arbitrum',
          balance: '500',
          usdValue: '$2,250.00',
          priceChange24h: -1.2,
          logo: '/logos/crypto/arb-pro.svg',
        },
      ]);

      setTransactions([
        {
          id: '1',
          type: 'swap',
          fromToken: 'USDC',
          toToken: 'ETH',
          fromAmount: '5000',
          toAmount: '2.5',
          status: 'success',
          timestamp: Date.now() - 3600000,
          hash: '0x123abc...',
          chainId: 1,
          fee: '5.50',
        },
        {
          id: '2',
          type: 'bridge',
          fromToken: 'ETH',
          toToken: 'ETH',
          fromAmount: '1',
          toAmount: '0.995',
          status: 'success',
          timestamp: Date.now() - 7200000,
          hash: '0x456def...',
          chainId: 42161,
          fee: '0.05',
        },
        {
          id: '3',
          type: 'swap',
          fromToken: 'ARB',
          toToken: 'USDC',
          fromAmount: '250',
          toAmount: '1125',
          status: 'pending',
          timestamp: Date.now() - 300000,
          hash: '0x789ghi...',
          chainId: 42161,
        },
      ]);

      setTotalBalance('$17,500.00');
      setBalanceChange24h(1.2);
      setLoading(false);
    }, 500);
  }, [isConnected, address]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-96 rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900/50">
        <div className="text-center">
          <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Connect your wallet to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm mb-2">Total Portfolio Value</p>
            <div className="flex items-center gap-3">
              <h1 className={`text-4xl font-bold transition ${showBalance ? 'text-white' : 'text-gray-400'}`}>
                {showBalance ? totalBalance : '••••••'}
              </h1>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                {showBalance ? <Eye className="w-5 h-5 text-gray-400" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <p className={`text-lg font-semibold ${balanceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {balanceChange24h >= 0 ? '+' : ''}{balanceChange24h.toFixed(2)}%
            </p>
            <p className="text-gray-400 text-sm">24h Change</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700">
          <button className="flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 text-green-400 py-2 rounded-lg transition">
            <ArrowDownLeft className="w-4 h-4" />
            Receive
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 text-blue-400 py-2 rounded-lg transition">
            <ArrowUpRight className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        {(['overview', 'assets', 'transactions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 capitalize font-semibold transition ${
              activeTab === tab
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Assets Overview */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Your Assets</h3>
            <div className="space-y-3">
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : assets.length > 0 ? (
                assets.map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition">
                    <div className="flex items-center gap-3">
                      {asset.logo && <img src={asset.logo} alt={asset.symbol} className="w-8 h-8" />}
                      <div>
                        <p className="font-semibold text-white">{asset.symbol}</p>
                        <p className="text-xs text-gray-400">{asset.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">{asset.balance} {asset.symbol}</p>
                      <p className={`text-sm ${asset.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No assets found</p>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-2">
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : transactions.slice(0, 3).length > 0 ? (
                transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition">
                    <div className="flex items-center gap-3">
                      {tx.type === 'swap' ? (
                        <div className="p-2 bg-blue-900/30 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-purple-900/30 rounded-lg">
                          <ArrowDownLeft className="w-4 h-4 text-purple-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white capitalize">{tx.type}</p>
                        <p className="text-xs text-gray-400">{formatDate(tx.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {tx.fromAmount} {tx.fromToken} → {tx.toAmount} {tx.toToken}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          tx.status === 'success'
                            ? 'bg-green-900/30 text-green-400'
                            : tx.status === 'pending'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No transactions yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : assets.length > 0 ? (
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition">
                  <div className="flex items-center gap-4">
                    {asset.logo && <img src={asset.logo} alt={asset.symbol} className="w-10 h-10" />}
                    <div>
                      <p className="font-semibold text-white text-lg">{asset.symbol}</p>
                      <p className="text-sm text-gray-400">{asset.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{asset.balance}</p>
                    <p className="text-sm text-gray-400">{asset.usdValue}</p>
                    <p className={`text-sm font-semibold ${asset.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No assets</p>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                  <div className="flex items-center gap-4 flex-1">
                    {tx.type === 'swap' ? (
                      <div className="p-3 bg-blue-900/30 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                      </div>
                    ) : tx.type === 'bridge' ? (
                      <div className="p-3 bg-purple-900/30 rounded-lg">
                        <ArrowDownLeft className="w-5 h-5 text-purple-400" />
                      </div>
                    ) : (
                      <div className="p-3 bg-green-900/30 rounded-lg">
                        <Download className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-white capitalize">{tx.type}</p>
                      <p className="text-sm text-gray-400">
                        {tx.fromAmount} {tx.fromToken} → {tx.toAmount} {tx.toToken}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {tx.fee && <p className="text-sm text-gray-400">Fee: ${tx.fee}</p>}
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded text-xs font-semibold ${
                        tx.status === 'success'
                          ? 'bg-green-900/30 text-green-400'
                          : tx.status === 'pending'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No transactions</p>
          )}
        </div>
      )}
    </div>
  );
};
