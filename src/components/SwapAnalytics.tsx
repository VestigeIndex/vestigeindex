import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, Target, AlertTriangle } from 'lucide-react';

interface PricePoint {
  time: number;
  price: number;
}

interface SwapRoute {
  id: string;
  name: string;
  rate: number;
  impact: number;
  fee: number;
  liquidity: string;
  latency: number;
}

interface SwapAnalyticsProps {
  fromToken: string;
  toToken: string;
  amount: string;
  chainId: number;
}

export const SwapAnalytics: React.FC<SwapAnalyticsProps> = ({
  fromToken,
  toToken,
  amount,
  chainId,
}) => {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [routes, setRoutes] = useState<SwapRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock price history data
  const mockPriceHistory: PricePoint[] = Array.from({ length: 24 }, (_, i) => ({
    time: Date.now() - (24 - i) * 3600000,
    price: 1800 + Math.random() * 200 - 100,
  }));

  // Mock swap routes
  const mockRoutes: SwapRoute[] = [
    {
      id: '1inch',
      name: '1inch Network',
      rate: parseFloat(amount) * 1.02,
      impact: 0.5,
      fee: 0,
      liquidity: '$45.2M',
      latency: 280,
    },
    {
      id: 'openocean',
      name: 'OpenOcean',
      rate: parseFloat(amount) * 1.015,
      impact: 0.8,
      fee: 0.3,
      liquidity: '$32.8M',
      latency: 350,
    },
    {
      id: 'odos',
      name: 'Odos',
      rate: parseFloat(amount) * 1.01,
      impact: 1.2,
      fee: 0.5,
      liquidity: '$28.5M',
      latency: 420,
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPriceHistory(mockPriceHistory);
      setRoutes(mockRoutes);
      setSelectedRoute('1inch');
      setIsLoading(false);
    }, 500);
  }, [fromToken, toToken, chainId]);

  const bestRoute = routes.reduce((prev, current) =>
    current.rate > prev.rate ? current : prev
  );

  const priceChange = priceHistory.length >= 2
    ? ((priceHistory[priceHistory.length - 1].price - priceHistory[0].price) /
        priceHistory[0].price) *
      100
    : 0;

  return (
    <div className="space-y-4">
      {/* Price Analytics */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            24h Price Action
          </h3>
          <span
            className={`flex items-center gap-1 font-semibold ${
              priceChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {priceChange >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(priceChange).toFixed(2)}%
          </span>
        </div>

        {/* Simple chart visualization */}
        <div className="h-32 flex items-end gap-1">
          {priceHistory.map((point, idx) => {
            const minPrice = Math.min(...priceHistory.map((p) => p.price));
            const maxPrice = Math.max(...priceHistory.map((p) => p.price));
            const range = maxPrice - minPrice || 1;
            const height = ((point.price - minPrice) / range) * 100;

            return (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm opacity-60 hover:opacity-100 transition cursor-pointer"
                style={{ height: `${Math.max(height, 10)}%` }}
              />
            );
          })}
        </div>

        {/* Price stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-700">
          <div>
            <p className="text-xs text-gray-500">High</p>
            <p className="text-sm font-semibold text-white">
              ${Math.max(...priceHistory.map((p) => p.price)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg</p>
            <p className="text-sm font-semibold text-white">
              ${(priceHistory.reduce((sum, p) => sum + p.price, 0) / priceHistory.length).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Low</p>
            <p className="text-sm font-semibold text-white">
              ${Math.min(...priceHistory.map((p) => p.price)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Route Comparison */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Available Routes
        </h3>

        <div className="space-y-2">
          {routes.map((route) => {
            const isSelected = selectedRoute === route.id;
            const isBest = route.rate === bestRoute.rate;

            return (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`w-full p-3 rounded-lg border transition text-left ${
                  isSelected
                    ? 'bg-blue-900/30 border-blue-600'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{route.name}</span>
                    {isBest && (
                      <span className="px-2 py-0.5 bg-green-600/30 text-green-400 text-xs rounded-full border border-green-600/50">
                        Best Rate
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-white">
                    {route.rate.toFixed(6)} {toToken}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Impact</p>
                    <p className={`font-semibold ${
                      route.impact > 2 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {route.impact.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fee</p>
                    <p className="font-semibold text-white">{route.fee}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Liquidity</p>
                    <p className="font-semibold text-white">{route.liquidity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Latency</p>
                    <p className="font-semibold text-white">{route.latency}ms</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Best Route Summary */}
        {selectedRoute && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-start gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">
                  You'll receive approximately
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {routes.find((r) => r.id === selectedRoute)?.rate.toFixed(6)} {toToken}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ~${(routes.find((r) => r.id === selectedRoute)?.rate || 0) * 1800}.00 USD
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warnings */}
      {routes.some((r) => r.impact > 5) && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 text-sm font-semibold">High Price Impact</p>
            <p className="text-red-300 text-xs">Some routes show significant price impact. Consider smaller amounts.</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-3 text-xs text-blue-300">
        Rates update every 10 seconds. Best rates may vary based on liquidity and market conditions.
      </div>
    </div>
  );
};
