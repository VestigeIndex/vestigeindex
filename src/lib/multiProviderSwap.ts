// Vestige Index - Multi-Provider Swap Service
// Free APIs: 1inch, OpenOcean, Matcha, DEXAggregator

import { ethers } from 'ethers';

export interface SwapProvider {
  name: string;
  icon: string;
  id: 'oneinch' | 'openocean' | 'matcha' | 'odos';
  chains: number[];
  feePercentage: number;
}

export interface SwapQuote {
  provider: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  rate: number;
  priceImpact: number;
  fees: {
    platform: string;
    network: string;
  };
  estimatedTime: number;
  routePath: string[];
  executable: boolean;
}

export interface SwapTransaction {
  id: string;
  hash: string;
  provider: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  chainId: number;
  fee: string;
}

// Supported Swap Providers
export const SWAP_PROVIDERS: SwapProvider[] = [
  {
    name: '1inch',
    icon: '/logos/providers/1inch.svg',
    id: 'oneinch',
    chains: [1, 56, 137, 42161, 10, 8453],
    feePercentage: 0,
  },
  {
    name: 'OpenOcean',
    icon: '/logos/providers/openocean.svg',
    id: 'openocean',
    chains: [1, 56, 137, 42161, 10, 8453, 25],
    feePercentage: 0.3,
  },
  {
    name: 'Matcha',
    icon: '/logos/providers/matcha.svg',
    id: 'matcha',
    chains: [1, 137, 42161],
    feePercentage: 0,
  },
  {
    name: 'Odos',
    icon: '/logos/providers/odos.svg',
    id: 'odos',
    chains: [1, 56, 137, 42161, 10, 8453, 25],
    feePercentage: 0.5,
  },
];

// 1inch API
export async function get1inchQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string
): Promise<SwapQuote | null> {
  try {
    const url = `https://api.1inch.io/v5.2/${chainId}/quote`;
    const params = new URLSearchParams({
      fromTokenAddress: fromToken,
      toTokenAddress: toToken,
      amount: amount,
      slippage: '1',
    });

    const response = await fetch(`${url}?${params}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();

    return {
      provider: '1inch',
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: data.toAmount,
      rate: parseFloat(data.toAmount) / parseFloat(amount),
      priceImpact: parseFloat(data.estimatedGas || '0'),
      fees: { platform: '0%', network: data.estimatedGas },
      estimatedTime: 15,
      routePath: data.protocols ? data.protocols[0] : [],
      executable: true,
    };
  } catch (error) {
    console.error('1inch quote error:', error);
    return null;
  }
}

// OpenOcean API (V4 - Free)
export async function getOpenOceanQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string
): Promise<SwapQuote | null> {
  try {
    const chainName = getChainNameForOpenOcean(chainId);
    const url = `https://open-api.openocean.finance/v4/${chainName}/quote`;

    const params = new URLSearchParams({
      inTokenAddress: fromToken,
      outTokenAddress: toToken,
      amount: amount,
      slippage: '1',
    });

    const response = await fetch(`${url}?${params}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (!data.data) return null;

    return {
      provider: 'OpenOcean',
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: data.data.outAmount,
      rate: parseFloat(data.data.outAmount) / parseFloat(amount),
      priceImpact: data.data.priceImpact || 0,
      fees: { platform: '0.3%', network: '~0' },
      estimatedTime: 20,
      routePath: data.data.routes || [],
      executable: true,
    };
  } catch (error) {
    console.error('OpenOcean quote error:', error);
    return null;
  }
}

// Matcha API (0x Protocol - Free)
export async function getMatchaQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string
): Promise<SwapQuote | null> {
  try {
    const url = `https://api.0x.org/swap/v1/quote`;

    const params = new URLSearchParams({
      sellToken: fromToken,
      buyToken: toToken,
      sellAmount: amount,
      slippagePercentage: '1',
      chainId: chainId.toString(),
    });

    const response = await fetch(`${url}?${params}`, {
      headers: { '0x-api-key': 'free' }, // 0x free tier
    });

    if (!response.ok) return null;

    const data = await response.json();

    return {
      provider: 'Matcha',
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: data.buyAmount,
      rate: parseFloat(data.buyAmount) / parseFloat(amount),
      priceImpact: data.estimatedPriceImpact || 0,
      fees: { platform: '0%', network: data.estimatedGas },
      estimatedTime: 15,
      routePath: data.sources || [],
      executable: true,
    };
  } catch (error) {
    console.error('Matcha quote error:', error);
    return null;
  }
}

// Odos API - Free aggregator
export async function getOdosQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string
): Promise<SwapQuote | null> {
  try {
    const url = `https://api.odos.io/sor/quote/v2`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chainId,
        inputTokens: [{ tokenAddress: fromToken, amount }],
        outputTokens: [{ tokenAddress: toToken, proportion: 1 }],
        userAddr: userAddress,
        referralCode: 0,
        slippageLimitPercent: 1,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();

    const outAmount = data.outAmounts?.[0] || '0';

    return {
      provider: 'Odos',
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: outAmount,
      rate: parseFloat(outAmount) / parseFloat(amount),
      priceImpact: data.priceImpact || 0,
      fees: { platform: '0.5%', network: data.gas || '0' },
      estimatedTime: 25,
      routePath: data.paths || [],
      executable: true,
    };
  } catch (error) {
    console.error('Odos quote error:', error);
    return null;
  }
}

// Get best quote from all providers
export async function getBestSwapQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string,
  providers: string[] = ['oneinch', 'openocean', 'matcha', 'odos']
): Promise<SwapQuote[]> {
  const quotes: (SwapQuote | null)[] = await Promise.all([
    providers.includes('oneinch') ? get1inchQuote(chainId, fromToken, toToken, amount, userAddress) : null,
    providers.includes('openocean') ? getOpenOceanQuote(chainId, fromToken, toToken, amount) : null,
    providers.includes('matcha') ? getMatchaQuote(chainId, fromToken, toToken, amount) : null,
    providers.includes('odos') ? getOdosQuote(chainId, fromToken, toToken, amount, userAddress) : null,
  ]);

  return quotes.filter((q) => q !== null) as SwapQuote[];
}

function getChainNameForOpenOcean(chainId: number): string {
  const chainMap: Record<number, string> = {
    1: 'eth',
    56: 'bsc',
    137: 'polygon',
    42161: 'arbitrum',
    10: 'optimism',
    8453: 'base',
    25: 'cronos',
  };
  return chainMap[chainId] || 'eth';
}

export function getProviderForChain(chainId: number, providerId: string): SwapProvider | null {
  const provider = SWAP_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return null;
  if (provider.chains.includes(chainId)) return provider;
  return null;
}
