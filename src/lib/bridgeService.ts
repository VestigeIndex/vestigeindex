// src/lib/bridgeService.ts
// Multi-bridge aggregator: Stargate + LI.FI with platform fees

const VESTIGE_FEE_EVM = '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F';
const VESTIGE_FEE_SOLANA = 'BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt';
const PLATFORM_FEE = 0.001; // 0.1% platform fee

// 10 SUPPORTED CHAINS
export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', icon: '🔷', type: 'evm' as const, stargateId: 1, usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://eth.llamarpc.com' },
  { id: 56, name: 'BNB Chain', icon: '🟡', type: 'evm' as const, stargateId: 2, usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://bsc.llamarpc.com' },
  { id: 137, name: 'Polygon', icon: '🟣', type: 'evm' as const, stargateId: 6, usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://polygon.llamarpc.com' },
  { id: 42161, name: 'Arbitrum', icon: '🔵', type: 'evm' as const, stargateId: 10, usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEfffffffEEeE', rpc: 'https://arbitrum.llamarpc.com' },
  { id: 10, name: 'Optimism', icon: '🟠', type: 'evm' as const, stargateId: 11, usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://optimism.llamarpc.com' },
  { id: 8453, name: 'Base', icon: '🔵', type: 'evm' as const, stargateId: 16, usdc: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://base.llamarpc.com' },
  { id: 25, name: 'Cronos', icon: '💠', type: 'evm' as const, stargateId: 24, usdc: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://evm.cronos.org' },
  { id: 1404, name: 'BlockDAG', icon: '🔶', type: 'evm' as const, stargateId: 1404, usdc: '0xfA4B1dBa2a13C9510D73d8ed3d5A05B2a7a4fB8d', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://mainnet.blockdag.network' },
  { id: 501, name: 'Solana', icon: '🟣', type: 'solana' as const, stargateId: null, usdc: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', native: 'So11111111111111111111111111111111111111112', rpc: 'https://api.mainnet-beta.solana.com' },
];

// Token cache
const tokenCache: Map<number, BridgeToken[]> = new Map();
const routeCache: Map<string, BridgeRoute | null> = new Map();
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export interface BridgeToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  type: 'native' | 'erc20' | 'spl';
}

export interface BridgeRoute {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  bridgeType: 'stargate' | 'wormhole' | 'lifii';
  provider: 'Stargate' | 'LI.FI' | 'Wormhole';
  estimatedTime: string;
  fee: number;
  feeType: 'fixed' | 'variable';
  isEnabled: boolean;
}

export interface BridgeQuote {
  provider: string;
  bridgeType: string;
  estimatedAmount: string;
  platformFee: string;
  platformFeePercent: string;
  bridgeFee: string;
  bridgeFeePercent: string;
  totalFee: string;
  estimatedTime: string;
  routeData?: any;
}

// Platform fee
export function getPlatformFee(amountUSD: number): number {
  return amountUSD * PLATFORM_FEE;
}

export function getPlatformFeePercent(): number {
  return PLATFORM_FEE * 100;
}

// Check if Stargate supports token
function isStargateSupported(tokenSymbol: string): boolean {
  const stargateTokens = ['USDC', 'USDT', 'ETH', 'WETH', 'BNB', 'CRO', 'DAI', 'WBTC', 'SOL'];
  return stargateTokens.includes(tokenSymbol);
}

// Get Vestige fee based on volume (for tiered fees)
export function getVestigeFeePercent(amountUSD: number): number {
  if (amountUSD < 1000) return 0.0020;
  if (amountUSD < 10000) return 0.0015;
  return 0.0010;
}

export function getTokenSymbol(chainId: number, tokenType: 'native' | 'usdc'): string {
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
  if (!chain) return tokenType === 'usdc' ? 'USDC' : '???';
  if (tokenType === 'usdc') return 'USDC';
  switch (chain.id) {
    case 56: return 'BNB';
    case 25: return 'CRO';
    case 1404: return 'BDAG';
    case 501: return 'SOL';
    default: return 'ETH';
  }
}

// Get bridge tokens for chain
export async function getBridgeTokens(chainId: number): Promise<BridgeToken[]> {
  if (tokenCache.has(chainId)) {
    const cached = tokenCache.get(chainId)!;
    if (Date.now() - cacheTimestamp < CACHE_DURATION) return cached;
  }

  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
  if (!chain) return [];

  const tokens: BridgeToken[] = [
    {
      address: chain.native,
      symbol: chain.id === 56 ? 'BNB' : chain.id === 25 ? 'CRO' : chain.id === 1404 ? 'BDAG' : chain.id === 501 ? 'SOL' : 'ETH',
      name: chain.name === 'BNB Chain' ? 'BNB' : chain.name === 'Cronos' ? 'Cronos' : chain.name === 'BlockDAG' ? 'BlockDAG' : chain.name === 'Solana' ? 'Solana' : 'Ethereum',
      decimals: 18,
      type: 'native',
    },
  ];

  if (chain.usdc) {
    tokens.push({
      address: chain.usdc,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      type: chain.id === 501 ? 'spl' : 'erc20',
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    });
  }

  // Add common tokens for EVM
  if (chain.type === 'evm' && chain.stargateId) {
    const commonTokens = [
      { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
      { symbol: 'DAI', name: 'Dai', decimals: 18 },
      { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
      { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
    ];
    for (const t of commonTokens) {
      if (!tokens.find(x => x.symbol === t.symbol)) {
        tokens.push({
          address: '0x',
          symbol: t.symbol,
          name: t.name,
          decimals: t.decimals,
          type: 'erc20',
        });
      }
    }
  }

  const validTokens = tokens.filter(t => t.address !== '0x');
  tokenCache.set(chainId, validTokens);
  cacheTimestamp = Date.now();
  return validTokens;
}

// Check if route exists
export async function checkBridgeRoute(
  fromChainId: number,
  toChainId: number,
  tokenSymbol: string
): Promise<BridgeRoute | null> {
  const cacheKey = `${fromChainId}-${toChainId}-${tokenSymbol}`;
  if (routeCache.has(cacheKey)) return routeCache.get(cacheKey)!;

  const fromChain = SUPPORTED_CHAINS.find(c => c.id === fromChainId);
  const toChain = SUPPORTED_CHAINS.find(c => c.id === toChainId);
  if (!fromChain || !toChain || fromChainId === toChainId) {
    routeCache.set(cacheKey, null);
    return null;
  }

  let bridgeType: 'stargate' | 'wormhole' | 'lifii' = 'stargate';
  let provider: 'Stargate' | 'LI.FI' | 'Wormhole' = 'Stargate';
  let estimatedTime = '~5-15 min';
  let fee = 0.0006;
  let feeType: 'fixed' | 'variable' = 'variable';

  if (fromChain.type === 'evm' && toChain.type === 'evm') {
    if (!fromChain.stargateId || !toChain.stargateId) {
      // Fallback to LI.FI
      bridgeType = 'lifii';
      provider = 'LI.FI';
      estimatedTime = '~10-20 min';
    }
    bridgeType = 'stargate';
    provider = 'Stargate';
    estimatedTime = '~5-15 min';
  } else if ((fromChain.type === 'evm' && toChain.type === 'solana') || 
            (fromChain.type === 'solana' && toChain.type === 'evm')) {
    bridgeType = 'wormhole';
    provider = 'Wormhole';
    estimatedTime = '~10-30 min';
  } else {
    routeCache.set(cacheKey, null);
    return null;
  }

  const route: BridgeRoute = {
    fromChain: fromChainId,
    toChain: toChainId,
    fromToken: tokenSymbol,
    toToken: tokenSymbol,
    bridgeType,
    provider,
    estimatedTime,
    fee,
    feeType,
    isEnabled: true,
  };

  routeCache.set(cacheKey, route);
  return route;
}

// Get LI.FI quote (fallback)
async function getLifiQuote(fromChainId: number, toChainId: number, amount: string, tokenSymbol: string): Promise<any> {
  try {
    const response = await fetch(
      `https://li.quest/v1/quote?fromChain=${fromChainId}&toChain=${toChainId}&fromToken=${tokenSymbol}&toToken=${tokenSymbol}&fromAmount=${amount}`
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log('LI.FI API unavailable');
  }
  return null;
}

// Get best bridge quote with multi-provider
export async function getBridgeQuote(
  fromChain: typeof SUPPORTED_CHAINS[0],
  toChain: typeof SUPPORTED_CHAINS[0],
  amount: string,
  tokenType: 'native' | 'usdc',
  amountUSD: number,
  preferredProvider?: 'auto' | 'stargate' | 'lifii'
): Promise<BridgeQuote> {
  const tokenAddress = tokenType === 'usdc' ? fromChain.usdc : fromChain.native;
  const tokenSymbol = tokenType === 'usdc' ? 'USDC' : 
    (fromChain.id === 56 ? 'BNB' : fromChain.id === 25 ? 'CRO' : fromChain.id === 1404 ? 'BDAG' : fromChain.id === 501 ? 'SOL' : 'ETH');

  // Calculate platform fee
  const platformFeePercent = getVestigeFeePercent(amountUSD);
  const platformFee = parseFloat(amount) * platformFeePercent;
  const amountAfterPlatform = parseFloat(amount) - platformFee;

  let provider = 'Stargate';
  let bridgeType = 'Stargate';
  let bridgeFee = amountAfterPlatform * 0.0006;
  let estimatedTime = '~5-15 min';

  // Try Stargate first (auto mode)
  if (preferredProvider === 'auto' || preferredProvider === 'stargate') {
    if (fromChain.type === 'evm' && toChain.type === 'evm') {
      if (fromChain.stargateId && toChain.stargateId && isStargateSupported(tokenSymbol)) {
        provider = 'Stargate';
        bridgeType = 'Stargate';
        bridgeFee = amountAfterPlatform * 0.0006;
        estimatedTime = '~5-15 min';
      } else {
        // Fallback to LI.FI
        provider = 'LI.FI';
        bridgeType = 'LI.FI';
        bridgeFee = amountAfterPlatform * 0.003;
        estimatedTime = '~10-20 min';
      }
    } else if (fromChain.type === 'solana' || toChain.type === 'solana') {
      provider = 'Wormhole';
      bridgeType = 'Wormhole';
      bridgeFee = amountAfterPlatform * 0.0006;
      estimatedTime = '~10-30 min';
    }
  } else if (preferredProvider === 'lifii') {
    provider = 'LI.FI';
    bridgeType = 'LI.FI';
    bridgeFee = amountAfterPlatform * 0.003;
    estimatedTime = '~10-20 min';
  }

  const finalAmount = amountAfterPlatform - bridgeFee;
  const totalFee = platformFee + bridgeFee;

  return {
    provider,
    bridgeType,
    estimatedAmount: finalAmount.toFixed(6),
    platformFee: platformFee.toFixed(6),
    platformFeePercent: (platformFeePercent * 100).toFixed(2),
    bridgeFee: bridgeFee.toFixed(6),
    bridgeFeePercent: ((bridgeFee / amountAfterPlatform) * 100).toFixed(2),
    totalFee: totalFee.toFixed(6),
    estimatedTime,
  };
}

export async function getDestinationChains(fromChainId: number, tokenSymbol: string): Promise<number[]> {
  const validChains: number[] = [];
  for (const chain of SUPPORTED_CHAINS) {
    if (chain.id === fromChainId) continue;
    const route = await checkBridgeRoute(fromChainId, chain.id, tokenSymbol);
    if (route?.isEnabled) validChains.push(chain.id);
  }
  return validChains;
}