import React, { useState } from 'react';
import { Calculator, RefreshCw, TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';

export default function Tools() {
  const [fromAmount, setFromAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('BTC');
  const [toAmount, setToAmount] = useState<string>('0');
  const [gasPrice, setGasPrice] = useState<string>('20');
  const [transactionAmount, setTransactionAmount] = useState<string>('1');

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
    { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
    { code: 'BNB', name: 'Binance Coin', symbol: 'BNB' },
    { code: 'SOL', name: 'Solana', symbol: 'SOL' }
  ];

  const gasPrices = [
    { speed: 'Slow', price: '10', time: '~30s' },
    { speed: 'Standard', price: '20', time: '~15s' },
    { speed: 'Fast', price: '30', time: '~5s' },
    { speed: 'Instant', price: '50', time: '~2s' }
  ];

  // Simple conversion function (in real app, this would call an API)
  const convertCurrency = () => {
    const rates: Record<string, number> = {
      'USD-BTC': 1 / 45000,
      'USD-ETH': 1 / 2500,
      'USD-BNB': 1 / 300,
      'USD-SOL': 1 / 100,
      'BTC-USD': 45000,
      'ETH-USD': 2500,
      'BNB-USD': 300,
      'SOL-USD': 100,
      'BTC-ETH': 45000 / 2500,
      'ETH-BTC': 2500 / 45000
    };

    const key = `${fromCurrency}-${toCurrency}`;
    const rate = rates[key] || 1;
    const result = (parseFloat(fromAmount) * rate).toFixed(6);
    setToAmount(result);
  };

  const swap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Crypto Tools</h1>
              <p className="text-sm text-gray-400 mt-1">Professional trading and analysis tools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Currency Converter */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="text-blue-400" size={24} />
              <h2 className="text-xl font-bold text-white">Currency Converter</h2>
            </div>

            <div className="space-y-4">
              {/* From */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">From</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter amount"
                  />
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {currencies.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={swap}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw size={20} className="text-gray-400" />
                </button>
              </div>

              {/* To */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">To</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={toAmount}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Result"
                  />
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {currencies.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Convert Button */}
              <button
                onClick={convertCurrency}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Convert
              </button>
            </div>
          </div>

          {/* Gas Calculator */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-yellow-400" size={24} />
              <h2 className="text-xl font-bold text-white">Gas Calculator</h2>
            </div>

            <div className="space-y-4">
              {/* Transaction Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Transaction Amount (ETH)</label>
                <input
                  type="number"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter amount"
                />
              </div>

              {/* Gas Price Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Gas Speed</label>
                <div className="grid grid-cols-2 gap-2">
                  {gasPrices.map(gas => (
                    <button
                      key={gas.speed}
                      onClick={() => setGasPrice(gas.price)}
                      className={`p-3 rounded-lg border transition-colors ${
                        gasPrice === gas.price
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">{gas.speed}</div>
                        <div className="text-xs opacity-75">{gas.time}</div>
                        <div className="text-xs opacity-75">{gas.price} Gwei</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gas Cost Calculation */}
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="font-medium text-white mb-3">Estimated Gas Cost</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gas Price:</span>
                    <span className="text-white">{gasPrice} Gwei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gas Limit:</span>
                    <span className="text-white">21,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Gas:</span>
                    <span className="text-white">{(parseFloat(gasPrice) * 21000 / 1000000000).toFixed(6)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">USD Value:</span>
                    <span className="text-white">${(parseFloat(gasPrice) * 21000 / 1000000000 * 2500).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Tracker */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-green-400" size={24} />
              <h2 className="text-xl font-bold text-white">Portfolio Tracker</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Total Portfolio Value</span>
                  <span className="text-2xl font-bold text-white">$25,450.00</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-green-400" />
                  <span className="text-green-400 text-sm">+12.5% ($2,845.00)</span>
                  <span className="text-gray-400 text-xs">24h</span>
                </div>
              </div>

              {/* Holdings */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-400 mb-2">Holdings</div>
                {[
                  { symbol: 'BTC', amount: '0.25', value: '$11,250.00', change: '+5.2%' },
                  { symbol: 'ETH', amount: '3.5', value: '$8,750.00', change: '+3.8%' },
                  { symbol: 'SOL', amount: '45', value: '$4,500.00', change: '+8.1%' },
                  { symbol: 'USDT', amount: '950', value: '$950.00', change: '0.0%' }
                ].map((holding, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {holding.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{holding.symbol}</div>
                        <div className="text-xs text-gray-400">{holding.amount}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">{holding.value}</div>
                      <div className={`text-xs ${holding.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {holding.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profit/Loss Calculator */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="text-purple-400" size={24} />
              <h2 className="text-xl font-bold text-white">Profit/Loss Calculator</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Initial Investment ($)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter initial amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Current Value ($)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="Enter current value"
                />
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profit/Loss:</span>
                    <span className="text-green-400 font-bold">+$2,500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ROI:</span>
                    <span className="text-green-400 font-bold">+25.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hold Period:</span>
                    <span className="text-white">6 months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
