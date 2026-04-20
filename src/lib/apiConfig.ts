// API Configuration and Integration
// All APIs are FREE and require no API keys

export const API_CONFIG = {
  // 1inch API - Decentralized exchange aggregator
  ONEINCH: {
    BASE_URL: 'https://api.1inch.io/v5.2',
    DESCRIPTION: '1inch Protocol - DEX aggregator',
    SUPPORTED_CHAINS: [1, 56, 137, 42161, 10, 8453],
    FEE: '0%',
    SPEED: 'Fast',
  },

  // OpenOcean API - Multi-DEX aggregator
  OPENOCEAN: {
    BASE_URL: 'https://open-api.openocean.finance/v4',
    DESCRIPTION: 'OpenOcean - Multi-chain DEX',
    SUPPORTED_CHAINS: [1, 56, 137, 42161, 10, 8453, 25],
    FEE: '0.3%',
    SPEED: 'Medium',
  },

  // Matcha (0x) API - Protocol powered by 0x
  MATCHA: {
    BASE_URL: 'https://api.0x.org/swap/v1/quote',
    DESCRIPTION: 'Matcha - Powered by 0x Protocol',
    SUPPORTED_CHAINS: [1, 137, 42161],
    FEE: '0%',
    SPEED: 'Fast',
  },

  // Odos API - Intent-based routing
  ODOS: {
    BASE_URL: 'https://api.odos.io/sor/quote/v2',
    DESCRIPTION: 'Odos - Intent-based routing',
    SUPPORTED_CHAINS: [1, 56, 137, 42161, 10, 8453, 25],
    FEE: '0.5%',
    SPEED: 'Optimal',
  },

  // CoinGecko API - Market data (100% free, no key needed)
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    DESCRIPTION: 'CoinGecko - Market data',
    RATE_LIMIT: '10-50 calls/min',
    FEE: 'Free',
  },

  // Binance API - Market data (public endpoints)
  BINANCE: {
    BASE_URL: 'https://api.binance.com/api/v3',
    DESCRIPTION: 'Binance - Market data',
    RATE_LIMIT: 'Unlimited',
    FEE: 'Free',
  },

  // Etherscan API - On-chain data (rate limited but free tier available)
  ETHERSCAN: {
    BASE_URL: 'https://api.etherscan.io/api',
    DESCRIPTION: 'Etherscan - On-chain data',
    RATE_LIMIT: '5 calls/sec (free)',
    FEE: 'Free with limits',
  },
};

// Chain IDs and Names
export const CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH', icon: '/logos/networks/ethereum.svg' },
  56: { name: 'BNB Chain', symbol: 'BNB', icon: '/logos/networks/bnb-chain.svg' },
  137: { name: 'Polygon', symbol: 'MATIC', icon: '/logos/networks/polygon.svg' },
  42161: { name: 'Arbitrum', symbol: 'ARB', icon: '/logos/networks/arbitrum.svg' },
  10: { name: 'Optimism', symbol: 'OP', icon: '/logos/networks/optimism.svg' },
  8453: { name: 'Base', symbol: 'ETH', icon: '/logos/networks/base.svg' },
  25: { name: 'Cronos', symbol: 'CRO', icon: '/logos/networks/cronos.svg' },
  501: { name: 'Solana', symbol: 'SOL', icon: '/logos/networks/solana.svg' },
};

// Best practices for using free APIs
export const API_BEST_PRACTICES = {
  RATE_LIMITING: {
    description: 'Implement caching and batching to avoid rate limits',
    examples: [
      'Cache price data for 30-60 seconds',
      'Batch multiple requests when possible',
      'Implement exponential backoff for retries',
    ],
  },

  ERROR_HANDLING: {
    description: 'Handle API failures gracefully with fallbacks',
    strategies: [
      'Try primary provider (1inch) first',
      'Fallback to secondary (OpenOcean)',
      'Fallback to tertiary (Matcha/Odos)',
      'Show user-friendly error messages',
    ],
  },

  DATA_VALIDATION: {
    description: 'Always validate API responses',
    checks: [
      'Verify amounts are non-zero',
      'Check price impact is reasonable (< 50%)',
      'Validate token addresses match',
      'Ensure sufficient balance',
    ],
  },

  CACHING_STRATEGY: {
    tokens: '5 minutes', // Cache token lists
    prices: '30-60 seconds', // Cache price quotes
    balances: '2-5 seconds', // Cache wallet balances
    routes: '1 minute', // Cache swap routes
  },
};

// Token categories (only tokens available in free APIs)
export const TOKEN_CATEGORIES = {
  STABLECOINS: ['USDC', 'USDT', 'DAI', 'BUSD'],
  MAJORS: ['BTC', 'ETH', 'BNB', 'SOL'],
  LAYER2: ['ARB', 'OP', 'MATIC'],
  DEFI: ['UNI', 'AAVE', 'LINK', 'CURVE'],
  EMERGING: ['OPTIMISM', 'ARBITRUM', 'BASE'],
};

// Error codes and messages
export const API_ERRORS = {
  INSUFFICIENT_LIQUIDITY: {
    code: 1001,
    message: 'Insufficient liquidity for this trade',
    suggestion: 'Try a smaller amount or different token pair',
  },
  RATE_LIMIT: {
    code: 429,
    message: 'API rate limit exceeded',
    suggestion: 'Please wait a moment before retrying',
  },
  INVALID_TOKEN: {
    code: 1002,
    message: 'Token not found on this chain',
    suggestion: 'Verify the token address and chain',
  },
  NETWORK_ERROR: {
    code: 503,
    message: 'Network service unavailable',
    suggestion: 'Please try again later',
  },
  INVALID_SLIPPAGE: {
    code: 1003,
    message: 'Slippage tolerance too low',
    suggestion: 'Increase slippage tolerance to 1-2%',
  },
};

// Performance monitoring
export const PERFORMANCE_METRICS = {
  enableMetrics: true,
  trackApiLatency: true,
  trackQuoteAccuracy: true,
  trackSuccess rates: true,
  analyticsEndpoint: '/api/metrics',
};

// Feature flags
export const FEATURE_FLAGS = {
  enableMultiProviderSwap: true,
  enablePriceComparison: true,
  enableRouteOptimization: true,
  enableHistoricalData: true,
  enablePortfolioTracking: true,
  enableNotifications: true,
};
