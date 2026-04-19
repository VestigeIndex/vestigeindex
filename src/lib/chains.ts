import { defineChain } from 'viem';

// Kasplex zkEVM Chain
export const kasplex = defineChain({
  id: 202555,
  name: 'Kasplex zkEVM',
  network: 'kasplex',
  nativeCurrency: { name: 'Kaspa', symbol: 'KAS', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc.kasplex.org'] },
    public: { http: ['https://evmrpc.kasplex.org'] }
  },
  blockExplorers: {
    default: { name: 'Kasplex Explorer', url: 'https://explorer.kasplex.org' }
  },
});

// Supported EVM chains list
export const SUPPORTED_CHAINS = {
  // Ethereum Mainnet
  1: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpc: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io',
  },
  // Polygon
  137: {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpc: 'https://polygon.llamarpc.com',
    explorer: 'https://polygonscan.com',
  },
  // BNB Chain
  56: {
    id: 56,
    name: 'BNB Chain',
    symbol: 'BNB',
    rpc: 'https://bsc-dataseed.binance.org',
    explorer: 'https://bscscan.com',
  },
  // Arbitrum
  42161: {
    id: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
  },
  // Optimism
  10: {
    id: 10,
    name: 'Optimism',
    symbol: 'ETH',
    rpc: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io',
  },
  // Avalanche
  43114: {
    id: 43114,
    name: 'Avalanche',
    symbol: 'AVAX',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io',
  },
  // Kasplex zkEVM
  202555: {
    id: 202555,
    name: 'Kasplex zkEVM',
    symbol: 'KAS',
    rpc: 'https://evmrpc.kasplex.org',
    explorer: 'https://explorer.kasplex.org',
  },
};

export const CHAIN_IDS = Object.keys(SUPPORTED_CHAINS).map(Number);