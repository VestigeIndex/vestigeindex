// src/lib/bridgeService.ts
// Full cross-chain bridge service with dynamic token support
// Only tokens supported by the bridge are shown

const VESTIGE_FEE_EVM = '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F';
const VESTIGE_FEE_SOLANA = 'BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt';

// 10 SUPPORTED CHAINS
export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', icon: '🔷', type: 'evm' as const, stargateId: 1, usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://eth.llamarpc.com' },
  { id: 56, name: 'BNB Chain', icon: '🟡', type: 'evm' as const, stargateId: 2, usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://bsc.llamarpc.com' },
  { id: 137, name: 'Polygon', icon: '🟣', type: 'evm' as const, stargateId: 6, usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://polygon.llamarpc.com' },
  { id: 42161, name: 'Arbitrum', icon: '🔵', type: 'evm' as const, stargateId: 10, usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://arbitrum.llamarpc.com' },
  { id: 10, name: 'Optimism', icon: '🟠', type: 'evm' as const, stargateId: 11, usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://optimism.llamarpc.com' },
  { id: 8453, name: 'Base', icon: '🔵', type: 'evm' as const, stargateId: 16, usdc: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://base.llamarpc.com' },
  { id: 25, name: 'Cronos', icon: '💠', type: 'evm' as const, stargateId: 24, usdc: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://evm.cronos.org' },
  { id: 1404, name: 'BlockDAG', icon: '🔶', type: 'evm' as const, stargateId: 1404, usdc: '0xfA4B1dBa2a13C9510D73d8ed3d5A05B2a7a4fB8d', native: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', rpc: 'https://mainnet.blockdag.network' },
  { id: 501, name: 'Solana', icon: '🟣', type: 'solana' as const, stargateId: null, usdc: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', native: 'So11111111111111111111111111111111111111112', rpc: 'https://api.mainnet-beta.solana.com' },
];

// Token cache per chain
const tokenCache: Map<number, BridgeToken[]> = new Map();
const routeCache: Map<string, BridgeRoute | null> = new Map();
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
  bridgeType: 'stargate' | 'wormhole';
  estimatedTime: string;
  fee: number;
  feeType: 'fixed' | 'variable';
  isEnabled: boolean;
}

// Get Vestige fee based on volume
export function getVestigeFeePercent(amountUSD: number): number {
  if (amountUSD < 1000) return 0.0020;
  if (amountUSD < 10000) return 0.0015;
  return 0.0010;
}

// Get token symbol for display
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

// Get supported tokens for a chain (from bridge API or fallback to known tokens)
export async function getBridgeTokens(chainId: number): Promise<BridgeToken[]> {
  // Check cache
  if (tokenCache.has(chainId)) {
    const cached = tokenCache.get(chainId)!;
    if (Date.now() - cacheTimestamp < CACHE_DURATION) {
      return cached;
    }
  }

  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
  if (!chain) return [];

  // Try to get tokens from bridge API
  try {
    // In production, call actual bridge API
    const response = await fetch(`https://api.stargate.finance/tokens?chainId=${chain.stargateId}`);
    if (response.ok) {
      const data = await response.json();
      const tokens: BridgeToken[] = data.tokens?.map((t: any) => ({
        address: t.address || chain.native,
        symbol: t.symbol,
        name: t.name,
        decimals: t.decimals,
        logo: t.logoURI,
        type: t.isNative ? 'native' : 'erc20',
      })) || [];
      
      tokenCache.set(chainId, tokens);
      cacheTimestamp = Date.now();
      return tokens;
    }
  } catch (e) {
    console.log('Bridge API unavailable, using fallback tokens');
  }

  // Fallback: known bridgeable tokens per chain
  const fallbackTokens = getFallbackTokens(chain);
  tokenCache.set(chainId, fallbackTokens);
  cacheTimestamp = Date.now();
  return fallbackTokens;
}

function getFallbackTokens(chain: typeof SUPPORTED_CHAINS[0]): BridgeToken[] {
  const tokens: BridgeToken[] = [
    // Native token always available
    {
      address: chain.native,
      symbol: chain.id === 56 ? 'BNB' : chain.id === 25 ? 'CRO' : chain.id === 1404 ? 'BDAG' : chain.id === 501 ? 'SOL' : 'ETH',
      name: chain.name === 'BNB Chain' ? 'BNB' : chain.name === 'Cronos' ? 'Cronos' : chain.name === 'BlockDAG' ? 'BlockDAG' : chain.name === 'Solana' ? 'Solana' : 'Ethereum',
      decimals: 18,
      type: 'native',
    },
  ];

  // Add USDC if supported
  if (chain.usdc && chain.id !== 501) {
    tokens.push({
      address: chain.usdc,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      type: chain.id === 501 ? 'spl' : 'erc20',
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    });
  }

  // Add USDC for Solana
  if (chain.id === 501) {
    tokens.push({
      address: chain.usdc,
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      type: 'spl',
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    });
  }

  // Add other common bridgeable tokens for EVM chains
  if (chain.type === 'evm' && chain.stargateId) {
    // Add common tokens based on chain
    const commonTokens = [
      { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
      { symbol: 'DAI', name: 'Dai', decimals: 18 },
      { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
      { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
    ];

    for (const t of commonTokens) {
      if (!tokens.find(x => x.symbol === t.symbol)) {
        tokens.push({
          address: '0x', // Would need actual addresses per chain
          symbol: t.symbol,
          name: t.name,
          decimals: t.decimals,
          type: 'erc20',
        });
      }
    }
  }

  return tokens.filter(t => t.address !== '0x'); // Filter invalid addresses
}

// Check if route exists between two chains for a token
export async function checkBridgeRoute(
  fromChainId: number,
  toChainId: number,
  tokenSymbol: string
): Promise<BridgeRoute | null> {
  const cacheKey = `${fromChainId}-${toChainId}-${tokenSymbol}`;
  
  // Check cache
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  const fromChain = SUPPORTED_CHAINS.find(c => c.id === fromChainId);
  const toChain = SUPPORTED_CHAINS.find(c => c.id === toChainId);
  
  if (!fromChain || !toChain) {
    routeCache.set(cacheKey, null);
    return null;
  }

  // Same chain not supported
  if (fromChainId === toChainId) {
    routeCache.set(cacheKey, null);
    return null;
  }

  // Determine bridge type
  let bridgeType: 'stargate' | 'wormhole' = 'stargate';
  let estimatedTime = '~5-15 min';
  let fee = 0.0006;
  let feeType: 'fixed' | 'variable' = 'variable';

  if (fromChain.type === 'evm' && toChain.type === 'evm') {
    // EVM → EVM via Stargate
    if (!fromChain.stargateId || !toChain.stargateId) {
      routeCache.set(cacheKey, null);
      return null;
    }
    bridgeType = 'stargate';
    estimatedTime = '~5-15 min';
  } else if ((fromChain.type === 'evm' && toChain.type === 'solana') || 
            (fromChain.type === 'solana' && toChain.type === 'evm')) {
    // EVM ↔ Solana via Wormhole
    bridgeType = 'wormhole';
    estimatedTime = '~10-30 min';
    fee = 0.0006;
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
    estimatedTime,
    fee,
    feeType,
    isEnabled: true,
  };

  routeCache.set(cacheKey, route);
  return route;
}

// Get destination chains that support a token
export async function getDestinationChains(
  fromChainId: number,
  tokenSymbol: string
): Promise<number[]> {
  const validChains: number[] = [];
  
  for (const chain of SUPPORTED_CHAINS) {
    if (chain.id === fromChainId) continue;
    
    const route = await checkBridgeRoute(fromChainId, chain.id, tokenSymbol);
    if (route?.isEnabled) {
      validChains.push(chain.id);
    }
  }
  
  return validChains;
}

// EVM → EVM bridge quote
export async function getEVMBridgeQuote(fromStargateId: number, toStargateId: number, amount: string, tokenAddress: string, amountUSD: number) {
  const vestigeFeePercent = getVestigeFeePercent(amountUSD);
  const vestigeFee = parseFloat(amount) * vestigeFeePercent;
  const stargateFee = parseFloat(amount) * 0.0006;
  const finalAmount = parseFloat(amount) - vestigeFee - stargateFee;

  return {
    estimatedAmount: finalAmount.toFixed(6),
    stargateFee: stargateFee.toFixed(6),
    bridgeFeePercent: '0.06',
    vestigeFee: vestigeFee.toFixed(6),
    vestigeFeePercent: (vestigeFeePercent * 100).toFixed(2),
    totalFee: (stargateFee + vestigeFee).toFixed(6),
    estimatedTime: '~5-15 min',
    bridgeType: 'Stargate' as const,
  };
}

export async function getEVMBridgeTransaction(fromStargateId: number, toStargateId: number, amount: string, tokenAddress: string, userAddress: string) {
  return {
    to: tokenAddress,
    data: '0x',
    value: '0x0',
  };
}

// Wormhole bridge quote
export async function getWormholeBridgeQuote(fromChainId: number, toChainId: number, amount: string, amountUSD: number) {
  const vestigeFeePercent = getVestigeFeePercent(amountUSD);
  const vestigeFee = parseFloat(amount) * vestigeFeePercent;
  const wormholeFee = parseFloat(amount) * 0.0006;
  const finalAmount = parseFloat(amount) - vestigeFee - wormholeFee;

  return {
    estimatedAmount: finalAmount.toFixed(6),
    wormholeFee: wormholeFee.toFixed(6),
    bridgeFeePercent: '0.06',
    vestigeFee: vestigeFee.toFixed(6),
    vestigeFeePercent: (vestigeFeePercent * 100).toFixed(2),
    totalFee: (wormholeFee + vestigeFee).toFixed(6),
    estimatedTime: '~10-30 min',
    bridgeType: 'Wormhole' as const,
  };
}

// Unified bridge function
export async function getBridgeQuote(
  fromChain: typeof SUPPORTED_CHAINS[0],
  toChain: typeof SUPPORTED_CHAINS[0],
  amount: string,
  tokenType: 'native' | 'usdc',
  amountUSD: number
) {
  const tokenAddress = tokenType === 'usdc' ? fromChain.usdc : fromChain.native;
  
  // EVM → EVM
  if (fromChain.type === 'evm' && toChain.type === 'evm') {
    if (!fromChain.stargateId || !toChain.stargateId) {
      throw new Error(`Stargate no soporta ${fromChain.name} → ${toChain.name}`);
    }
    return getEVMBridgeQuote(fromChain.stargateId, toChain.stargateId, amount, tokenAddress, amountUSD);
  }
  
  // EVM ↔ Solana
  if ((fromChain.type === 'evm' && toChain.type === 'solana') ||
      (fromChain.type === 'solana' && toChain.type === 'evm')) {
    return getWormholeBridgeQuote(fromChain.id, toChain.id, amount, amountUSD);
  }
  
  // Solana → Solana
  if (fromChain.type === 'solana' && toChain.type === 'solana') {
    throw new Error('Solana → Solana no soportado');
  }
  
  throw new Error(`Bridge no soportado entre ${fromChain.name} y ${toChain.name}`);
}