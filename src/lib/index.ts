// Main export index for all DeFi platform services
// Import from here for cleaner imports throughout the app

// ============================================
// Swap Services
// ============================================
export {
  getBestSwapQuote,
  get1inchQuote,
  getOpenOceanQuote,
  getMatchaQuote,
  getOdosQuote,
  getProviderForChain,
  SWAP_PROVIDERS,
  type SwapProvider,
  type SwapQuote,
  type SwapTransaction,
} from './multiProviderSwap';

export {
  validateSwap,
  estimateGasCost,
  optimizeSwap,
  calculateTotalCost,
  isRouteStale,
  recommendProvider,
  performPreflightCheck,
  type SwapValidation,
  type SwapOptimization,
} from './swapValidation';

// ============================================
// Token & Index Services
// ============================================
export {
  AVAILABLE_CRYPTO_INDICES,
  getIndicesForChain,
  getIndicesForProvider,
  getTrendingIndices,
  getIndexBySymbol,
  getIndexByAddress,
  canSwapOnChain,
  getRecommendedPairs,
  getMarketData,
  type CryptoIndex,
  type MarketData,
} from './cryptoIndexManager';

// ============================================
// API Configuration
// ============================================
export {
  API_CONFIG,
  CHAINS,
  API_BEST_PRACTICES,
  TOKEN_CATEGORIES,
  API_ERRORS,
  FEATURE_FLAGS,
} from './apiConfig';

// ============================================
// Constants & Utilities
// ============================================
export {
  APP_VERSION,
  TOP100_FEE,
  BRIDGE_FEE,
  FEES,
  SUPPORTED_CHAINS,
  CHAIN_NAMES,
  CHAIN_IDS,
  RPC_URLS,
  EXPLORER_URLS,
  NATIVE_TOKENS,
} from './constants';

export {
  cn,
  truncateAddress,
  formatCurrency,
  formatNumber,
  parseAmount,
  calculatePriceImpact,
  getChainName,
  getExplorerUrl,
} from './utils';

// ============================================
// Market Data
// ============================================
export {
  fetchBinanceKlines,
  fetchCoinGeckoData,
  calculateTechnicals,
  getMarketSentiment,
  type KlineData,
  type TechnicalIndicators,
} from './marketData';

// ============================================
// Bridge Services
// ============================================
export {
  validateBridgeRoute,
  estimateBridgeFee,
  getBridgeProviders,
  type BridgeRoute,
  type BridgeProvider,
} from './bridgeService';

// ============================================
// Wallet Services
// ============================================
export {
  getWalletBalance,
  getTokenBalance,
  fetchUserTransactions,
  createTransaction,
  estimateGas,
  type WalletBalance,
  type TokenBalance,
} from './walletService';

// ============================================
// Type Definitions (Main)
// ============================================
export type {
  CryptoIndex,
  MarketData,
  SwapProvider,
  SwapQuote,
  SwapTransaction,
  SwapValidation,
  SwapOptimization,
} from './types';

// ============================================
// Feature Flags & Config
// ============================================
export const DeFiPlatformConfig = {
  version: '2.2.4',
  supportedChains: [1, 56, 137, 42161, 10, 8453, 25, 501],
  swapProviders: ['oneinch', 'openocean', 'matcha', 'odos'],
  feePercentage: 0.3,
  bridgeFeePercentage: 0.07,
  maxSlippage: 5,
  minSlippage: 0.1,
  rateUpdateInterval: 10000, // 10 seconds
};

// ============================================
// Helper Hooks (for React)
// ============================================
export {
  usePrices,
  useIndexHistory,
  useBinanceKlines,
  useNews,
} from '../hooks';

// ============================================
// Components
// ============================================
export {
  SwapAdvanced,
  PersonalDashboard,
  TransactionHistory,
  SwapAnalytics,
  Bridge,
  SwapInterface,
  WalletConnector,
} from '../components';

// ============================================
// Quick Access Getters
// ============================================

/**
 * Get all available swap providers
 */
export function getAllSwapProviders() {
  return SWAP_PROVIDERS;
}

/**
 * Get providers for specific chain
 */
export function getChainProviders(chainId: number) {
  return SWAP_PROVIDERS.filter((p) => p.chains.includes(chainId));
}

/**
 * Get all verified tokens
 */
export function getAllTokens() {
  return AVAILABLE_CRYPTO_INDICES;
}

/**
 * Quick swap quote (auto selects best provider)
 */
export async function quickSwapQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string
) {
  const quotes = await getBestSwapQuote(
    chainId,
    fromToken,
    toToken,
    amount,
    userAddress
  );
  return quotes[0] || null; // Return best quote
}

/**
 * Validate and optimize swap in one call
 */
export function validateAndOptimizeSwap(
  amount: string,
  fromToken: string,
  toToken: string,
  userBalance: string,
  rate: number,
  priceImpact: number,
  provider: string,
  slippageTolerance: number
) {
  const validation = validateSwap(
    amount,
    fromToken,
    toToken,
    userBalance,
    priceImpact,
    provider,
    slippageTolerance
  );

  if (!validation.isValid) {
    return { valid: false, errors: validation.errors };
  }

  const optimization = optimizeSwap(
    amount,
    rate,
    priceImpact,
    provider,
    slippageTolerance
  );

  return { valid: true, optimization, recommendation: validation.recommendation };
}

// ============================================
// Default Exports
// ============================================
export default {
  // Services
  swap: { getBestSwapQuote, validateSwap, optimizeSwap },
  tokens: { AVAILABLE_CRYPTO_INDICES, getIndicesForChain, getTrendingIndices },
  market: { getMarketData },
  bridge: { validateBridgeRoute },
  config: DeFiPlatformConfig,

  // Utilities
  utils: { formatCurrency, calculatePriceImpact },

  // Helpers
  quickSwapQuote,
  validateAndOptimizeSwap,
  getChainProviders,
  getAllTokens,
  getAllSwapProviders,
};
