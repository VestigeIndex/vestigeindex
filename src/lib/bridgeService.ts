// Advanced Bridge Service with Intelligent Routing
// Supports: Stargate (EVM↔EVM), Wormhole (EVM↔Solana), LI.FI (fallback)

import { BrowserProvider, Contract, parseUnits, formatUnits } from "ethers";
import type { SolanaWalletState } from "../context/AppContext";
import { EVM_FEE_ADDRESS, SOL_FEE_ADDRESS, BRIDGE_FEE } from "./constants";

// =============================================================================
// CONSTANTS
// =============================================================================

const STARGATE_API = 'https://api.stargate.finance/v1';
const LIFI_API = 'https://li.quest/v1';
const WORMHOLE_API = 'https://api.wormholescan.io';

// Bridge fee: 0.06% - 0.07% (depends on volume)
const BRIDGE_FEE_BPS = Math.round(BRIDGE_FEE * 100); // 6-7 = 0.06%-0.07%

// Supported chains by each bridge
const STARGATE_CHAINS = {
  1: 101,      // Ethereum
  56: 102,     // BNB Chain
  137: 109,    // Polygon
  42161: 110,  // Arbitrum
  10: 111,     // Optimism
  8453: 184,   // Base
  25: 181,     // Cronos
};

const WORMHOLE_CHAINS = {
  1: 2,        // Ethereum
  56: 4,       // BNB Chain
  137: 5,      // Polygon
  42161: 23,   // Arbitrum
  10: 24,      // Optimism
  8453: 30,    // Base
  25: 25,      // Cronos
  501: 1,      // Solana
};

// Supported tokens per chain
const SUPPORTED_TOKENS: Record<number, string[]> = {
  1: ['USDC', 'USDT', 'ETH', 'DAI'],
  56: ['USDC', 'USDT', 'BNB', 'BUSD'],
  137: ['USDC', 'USDT', 'MATIC', 'DAI'],
  42161: ['USDC', 'USDT', 'ETH', 'ARB'],
  10: ['USDC', 'USDT', 'ETH', 'OP'],
  8453: ['USDC', 'USDT', 'ETH', 'CBETH'],
  25: ['USDC', 'CRO', 'USDT'],
  501: ['USDC', 'SOL', 'USDT'],
};

// =============================================================================
// TYPES
// =============================================================================

export interface BridgeValidation {
  isValid: boolean;
  routeType: 'direct' | 'swap_bridge' | 'not_available';
  bridge: 'stargate' | 'wormhole' | 'lifi' | null;
  error?: string;
  estimatedTime?: number; // seconds
  estimatedFee?: string;
  steps?: string[];
}

export interface BridgeQuote {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  fee: string;
  bridgeUsed: 'stargate' | 'wormhole' | 'lifi';
  routeType: 'direct' | 'swap_bridge';
  steps: BridgeStep[];
  estimatedTime: number;
  slippage: string;
}

export interface BridgeStep {
  type: 'swap' | 'bridge' | 'claim';
  description: string;
  chainId: number;
  token?: string;
  amount?: string;
}

// =============================================================================
// VALIDATION LOGIC
// =============================================================================

/**
 * CRITICAL: Validate bridge route BEFORE allowing execution
 */
export async function validateBridgeRoute(
  fromChainId: number,
  toChainId: number,
  token: string
): Promise<BridgeValidation> {
  try {
    // Check if tokens are supported on both chains
    const fromTokensSupported = SUPPORTED_TOKENS[fromChainId] || [];
    const toTokensSupported = SUPPORTED_TOKENS[toChainId] || [];

    if (!fromTokensSupported.includes(token)) {
      return {
        isValid: false,
        routeType: 'not_available',
        bridge: null,
        error: `${token} is not supported on source chain`,
      };
    }

    // STEP 1: Check direct route via Stargate (EVM↔EVM)
    const isStargateAvailable = await checkStargateRoute(fromChainId, toChainId, token);
    if (isStargateAvailable) {
      return {
        isValid: true,
        routeType: 'direct',
        bridge: 'stargate',
        estimatedTime: 15 * 60, // ~15 minutes
        steps: ['Bridge via Stargate'],
      };
    }

    // STEP 2: Check Wormhole (EVM↔Solana or EVM↔EVM)
    const isWormholeAvailable = await checkWormholeRoute(fromChainId, toChainId);
    if (isWormholeAvailable) {
      return {
        isValid: true,
        routeType: 'direct',
        bridge: 'wormhole',
        estimatedTime: 10 * 60, // ~10 minutes
        steps: ['Bridge via Wormhole'],
      };
    }

    // STEP 3: Try swap + bridge route (token → USDC → bridge → USDC → token)
    const isSwapBridgeAvailable = toTokensSupported.includes('USDC');
    if (isSwapBridgeAvailable) {
      const stargateUSDCAvailable = await checkStargateRoute(fromChainId, toChainId, 'USDC');
      if (stargateUSDCAvailable) {
        return {
          isValid: true,
          routeType: 'swap_bridge',
          bridge: 'stargate',
          estimatedTime: 20 * 60, // ~20 minutes
          steps: [
            `Swap ${token} → USDC on source chain`,
            'Bridge USDC via Stargate',
            `Swap USDC → ${token} on destination chain`,
          ],
        };
      }
    }

    // STEP 4: Fallback to LI.FI
    const isLiFiAvailable = await checkLiFiRoute(fromChainId, toChainId, token);
    if (isLiFiAvailable) {
      return {
        isValid: true,
        routeType: 'direct',
        bridge: 'lifi',
        estimatedTime: 30 * 60, // ~30 minutes
        steps: ['Bridge via LI.FI aggregator'],
      };
    }

    // No route found
    return {
      isValid: false,
      routeType: 'not_available',
      bridge: null,
      error: `No bridge route available for ${token} from chain ${fromChainId} to ${toChainId}`,
    };
  } catch (error) {
    console.error('Bridge validation error:', error);
    return {
      isValid: false,
      routeType: 'not_available',
      bridge: null,
      error: 'Failed to validate bridge route',
    };
  }
}

/**
 * Check if direct route exists via Stargate
 */
async function checkStargateRoute(
  fromChainId: number,
  toChainId: number,
  token: string
): Promise<boolean> {
  try {
    // Check if both chains are supported
    if (!STARGATE_CHAINS[fromChainId as keyof typeof STARGATE_CHAINS]) return false;
    if (!STARGATE_CHAINS[toChainId as keyof typeof STARGATE_CHAINS]) return false;

    // For MVP, assume USDC and USDT have direct routes on all Stargate chains
    const stablecoins = ['USDC', 'USDT'];
    if (stablecoins.includes(token)) return true;

    // Check actual Stargate API
    const url = `${STARGATE_API}/routes?srcChainId=${fromChainId}&dstChainId=${toChainId}`;
    const response = await fetch(url);
    if (!response.ok) return false;

    const data = await response.json();
    return data.routes && data.routes.length > 0;
  } catch (error) {
    console.warn('Stargate route check failed:', error);
    return false;
  }
}

/**
 * Check if route exists via Wormhole
 */
async function checkWormholeRoute(fromChainId: number, toChainId: number): Promise<boolean> {
  try {
    const fromChainSupported = WORMHOLE_CHAINS[fromChainId as keyof typeof WORMHOLE_CHAINS];
    const toChainSupported = WORMHOLE_CHAINS[toChainId as keyof typeof WORMHOLE_CHAINS];

    if (!fromChainSupported || !toChainSupported) return false;

    // Wormhole supports most chains
    return true;
  } catch (error) {
    console.warn('Wormhole route check failed:', error);
    return false;
  }
}

/**
 * Check if route exists via LI.FI (fallback aggregator)
 */
async function checkLiFiRoute(
  fromChainId: number,
  toChainId: number,
  token: string
): Promise<boolean> {
  try {
    // LI.FI quote endpoint
    const url = `${LIFI_API}/quote?fromChain=${fromChainId}&toChain=${toChainId}&fromToken=0x1&toToken=0x1&fromAmount=1000000&slippage=0.5`;
    const response = await fetch(url);
    if (!response.ok) return false;

    const data = await response.json();
    return data.routes && data.routes.length > 0;
  } catch (error) {
    console.warn('LI.FI route check failed:', error);
    return false;
  }
}

// =============================================================================
// GET BRIDGE QUOTE
// =============================================================================

export async function getBridgeQuote(
  fromChainId: number,
  toChainId: number,
  fromToken: string,
  fromAmount: string
): Promise<BridgeQuote | null> {
  try {
    // Validate route first
    const validation = await validateBridgeRoute(fromChainId, toChainId, fromToken);
    if (!validation.isValid || !validation.bridge) {
      throw new Error(validation.error || 'No valid bridge route');
    }

    // Get quote based on bridge type
    let quote: BridgeQuote | null = null;

    if (validation.bridge === 'stargate') {
      quote = await getStargateQuote(fromChainId, toChainId, fromToken, fromAmount, validation.routeType);
    } else if (validation.bridge === 'wormhole') {
      quote = await getWormholeQuote(fromChainId, toChainId, fromToken, fromAmount);
    } else if (validation.bridge === 'lifi') {
      quote = await getLiFiQuote(fromChainId, toChainId, fromToken, fromAmount);
    }

    return quote;
  } catch (error) {
    console.error('Failed to get bridge quote:', error);
    return null;
  }
}

/**
 * Get quote from Stargate
 */
async function getStargateQuote(
  fromChainId: number,
  toChainId: number,
  token: string,
  amount: string,
  routeType: 'direct' | 'swap_bridge'
): Promise<BridgeQuote> {
  // Calculate fee
  const amountBN = BigInt(amount);
  const feeBN = (amountBN * BigInt(BRIDGE_FEE_BPS)) / BigInt(10000);

  const steps: BridgeStep[] = [];
  let toToken = token;

  if (routeType === 'swap_bridge') {
    steps.push({
      type: 'swap',
      description: `Swap ${token} to USDC`,
      chainId: fromChainId,
      token: 'USDC',
    });
    toToken = 'USDC';
  }

  steps.push({
    type: 'bridge',
    description: `Bridge ${toToken} via Stargate`,
    chainId: fromChainId,
    token: toToken,
    amount: (amountBN - feeBN).toString(),
  });

  if (routeType === 'swap_bridge') {
    steps.push({
      type: 'swap',
      description: `Swap USDC to ${token}`,
      chainId: toChainId,
      token: token,
    });
  }

  return {
    fromChain: fromChainId,
    toChain: toChainId,
    fromToken: token,
    toToken: token,
    fromAmount: amount,
    toAmount: (amountBN - feeBN).toString(),
    fee: formatUnits(feeBN, 6),
    bridgeUsed: 'stargate',
    routeType,
    steps,
    estimatedTime: routeType === 'swap_bridge' ? 20 * 60 : 15 * 60,
    slippage: '0.5',
  };
}

/**
 * Get quote from Wormhole
 */
async function getWormholeQuote(
  fromChainId: number,
  toChainId: number,
  token: string,
  amount: string
): Promise<BridgeQuote> {
  const amountBN = BigInt(amount);
  const feeBN = (amountBN * BigInt(BRIDGE_FEE_BPS)) / BigInt(10000);

  return {
    fromChain: fromChainId,
    toChain: toChainId,
    fromToken: token,
    toToken: token,
    fromAmount: amount,
    toAmount: (amountBN - feeBN).toString(),
    fee: formatUnits(feeBN, 6),
    bridgeUsed: 'wormhole',
    routeType: 'direct',
    steps: [
      {
        type: 'bridge',
        description: `Bridge ${token} via Wormhole`,
        chainId: fromChainId,
        token: token,
        amount: (amountBN - feeBN).toString(),
      },
      {
        type: 'claim',
        description: `Claim ${token} on destination chain`,
        chainId: toChainId,
        token: token,
      },
    ],
    estimatedTime: 10 * 60,
    slippage: '0.3',
  };
}

/**
 * Get quote from LI.FI (fallback)
 */
async function getLiFiQuote(
  fromChainId: number,
  toChainId: number,
  token: string,
  amount: string
): Promise<BridgeQuote> {
  try {
    const response = await fetch(
      `${LIFI_API}/quote?fromChain=${fromChainId}&toChain=${toChainId}&fromToken=USDC&toToken=USDC&fromAmount=${amount}&slippage=0.5`
    );

    if (!response.ok) throw new Error('LI.FI quote failed');

    const data = await response.json();
    const bestRoute = data.routes?.[0];

    if (!bestRoute) throw new Error('No route found');

    const amountBN = BigInt(amount);
    const feeBN = (amountBN * BigInt(BRIDGE_FEE_BPS)) / BigInt(10000);

    return {
      fromChain: fromChainId,
      toChain: toChainId,
      fromToken: token,
      toToken: token,
      fromAmount: amount,
      toAmount: (amountBN - feeBN).toString(),
      fee: formatUnits(feeBN, 6),
      bridgeUsed: 'lifi',
      routeType: 'direct',
      steps: [
        {
          type: 'bridge',
          description: `Bridge via LI.FI aggregator`,
          chainId: fromChainId,
          token: token,
        },
      ],
      estimatedTime: 30 * 60,
      slippage: '0.5',
    };
  } catch (error) {
    throw new Error('Failed to get LI.FI quote');
  }
}

// =============================================================================
// EXECUTE BRIDGE
// =============================================================================

export async function executeBridge(
  provider: BrowserProvider,
  quote: BridgeQuote,
  walletAddress: string
): Promise<string> {
  try {
    if (quote.bridgeUsed === 'stargate') {
      return await executeStargateBridge(provider, quote, walletAddress);
    } else if (quote.bridgeUsed === 'wormhole') {
      return await executeWormholeBridge(provider, quote, walletAddress);
    } else if (quote.bridgeUsed === 'lifi') {
      return await executeLiFiBridge(provider, quote, walletAddress);
    }

    throw new Error('Unknown bridge');
  } catch (error) {
    console.error('Bridge execution failed:', error);
    throw error;
  }
}

async function executeStargateBridge(
  provider: BrowserProvider,
  quote: BridgeQuote,
  walletAddress: string
): Promise<string> {
  // TODO: Implement actual Stargate bridge execution
  // This would involve:
  // 1. Approval of token on source chain
  // 2. Call to Stargate router
  // 3. Return tx hash
  console.log('Executing Stargate bridge:', quote);
  throw new Error('Stargate bridge execution not yet implemented');
}

async function executeWormholeBridge(
  provider: BrowserProvider,
  quote: BridgeQuote,
  walletAddress: string
): Promise<string> {
  // TODO: Implement actual Wormhole bridge execution
  console.log('Executing Wormhole bridge:', quote);
  throw new Error('Wormhole bridge execution not yet implemented');
}

async function executeLiFiBridge(
  provider: BrowserProvider,
  quote: BridgeQuote,
  walletAddress: string
): Promise<string> {
  // TODO: Implement actual LI.FI bridge execution
  console.log('Executing LI.FI bridge:', quote);
  throw new Error('LI.FI bridge execution not yet implemented');
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function isBridgeAvailable(chainId: number): boolean {
  return Boolean(
    STARGATE_CHAINS[chainId as keyof typeof STARGATE_CHAINS] ||
    WORMHOLE_CHAINS[chainId as keyof typeof WORMHOLE_CHAINS]
  );
}

export function getSupportedTokensForChain(chainId: number): string[] {
  return SUPPORTED_TOKENS[chainId] || [];
}

export function getBridgeNetworks(): number[] {
  return Object.keys({ ...STARGATE_CHAINS, ...WORMHOLE_CHAINS }).map(Number);
}
