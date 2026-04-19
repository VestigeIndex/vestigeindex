// src/lib/bridgeService.ts
// Full cross-chain bridge service: EVM↔EVM (Stargate), EVM↔Solana (Wormhole)

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

// Get Vestige fee based on volume
export function getVestigeFeePercent(amountUSD: number): number {
  if (amountUSD < 1000) return 0.0020;   // 0.20%
  if (amountUSD < 10000) return 0.0015; // 0.15%
  return 0.0010;                      // 0.10%
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

// EVM → EVM bridge (Stargate)
export async function getEVMBridgeQuote(fromStargateId: number, toStargateId: number, amount: string, tokenAddress: string, amountUSD: number) {
  const vestigeFeePercent = getVestigeFeePercent(amountUSD);
  const vestigeFee = parseFloat(amount) * vestigeFeePercent;
  
  // Simulated Stargate quote (in production, call real API)
  const stargateFee = parseFloat(amount) * 0.0006; // 0.06% base fee
  const estimatedAmount = parseFloat(amount);
  const finalAmount = estimatedAmount - vestigeFee - stargateFee;
  
  return {
    estimatedAmount: finalAmount.toFixed(6),
    stargateFee: stargateFee.toFixed(6),
    bridgeFeePercent: '0.06',
    vestigeFee: vestigeFee.toFixed(6),
    vestigeFeePercent: (vestigeFeePercent * 100).toFixed(2),
    totalFee: (stargateFee + vestigeFee).toFixed(6),
  };
}

export async function getEVMBridgeTransaction(fromStargateId: number, toStargateId: number, amount: string, tokenAddress: string, userAddress: string) {
  // In production, call actual Stargate API
  return {
    to: tokenAddress, // USDC contract for approval
    data: '0x', // Would be actual swap data
    value: '0x0',
  };
}

// Wormhole bridge (EVM ↔ Solana)
export async function getWormholeBridgeQuote(fromChainId: number, toChainId: number, amount: string, amountUSD: number) {
  const vestigeFeePercent = getVestigeFeePercent(amountUSD);
  const vestigeFee = parseFloat(amount) * vestigeFeePercent;
  const wormholeFee = parseFloat(amount) * 0.0006; // ~0.06%
  const finalAmount = parseFloat(amount) - vestigeFee - wormholeFee;
  
  return {
    estimatedAmount: finalAmount.toFixed(6),
    wormholeFee: wormholeFee.toFixed(6),
    bridgeFeePercent: '0.06',
    vestigeFee: vestigeFee.toFixed(6),
    vestigeFeePercent: (vestigeFeePercent * 100).toFixed(2),
    totalFee: (wormholeFee + vestigeFee).toFixed(6),
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
  
  // EVM → EVM (includes Cronos and BlockDAG)
  if (fromChain.type === 'evm' && toChain.type === 'evm') {
    if (!fromChain.stargateId || !toChain.stargateId) {
      throw new Error(`Stargate doesn't support ${fromChain.name} → ${toChain.name}`);
    }
    return getEVMBridgeQuote(fromChain.stargateId, toChain.stargateId, amount, tokenAddress, amountUSD);
  }
  
  // EVM → Solana or Solana → EVM (Wormhole)
  if ((fromChain.type === 'evm' && toChain.type === 'solana') ||
      (fromChain.type === 'solana' && toChain.type === 'evm')) {
    return getWormholeBridgeQuote(fromChain.id, toChain.id, amount, amountUSD);
  }
  
  // Solana → Solana (not supported)
  if (fromChain.type === 'solana' && toChain.type === 'solana') {
    throw new Error('Solana → Solana bridge not supported');
  }
  
  throw new Error(`Bridge not supported between ${fromChain.name} and ${toChain.name}`);
}