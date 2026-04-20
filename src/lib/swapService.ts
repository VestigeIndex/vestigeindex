import { BrowserProvider, JsonRpcSigner, Contract, parseUnits, formatUnits, ethers } from "ethers";
import { Connection, Transaction } from "@solana/web3.js";
import { EVM_FEE_ADDRESS, SOL_FEE_ADDRESS, TOP100_FEE, INDEX_FEE } from "./constants";
import { solanaEndpoint } from "../config/solana";
import type { SolanaWalletState } from "../context/AppContext";

// =============================================================================
// ÚNICO SERVICIO DE SWAP ACTIVO: OPENOCEAN V4
// =============================================================================
const OPENOCEAN_API = 'https://open-api.openocean.finance/v4';
const REFERRER_ADDRESS = '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F';

// Fee recipient address
const FEE_ADDRESS = EVM_FEE_ADDRESS;
const FEE_BPS = Math.round(TOP100_FEE * 100); // 30 = 0.3%

// =============================================================================
// APIS COMENTADAS - PAUSADAS
// =============================================================================

/*
// --- SWAP API (PAUSADO) ---
const SWAP_API_BASE = "https://api.swapapi.dev/v1";

// --- 1INCH API (PAUSADO) ---
const ONEINCH_API = "https://api.1inch.io/v5.0";
const ONEINCH_API_KEY = "...";

// --- UNISWAP GATEWAY (PAUSADO) ---
const UNISWAP_GATEWAY = "https://trade-api.gateway.uniswap.org/v1";
const UNISWAP_API_KEY = "4Ms8qZqQCQSu8CE3Uxhe4jHmwVuogtXWRObOGzm9mqQ";

// --- LI.FI API (PAUSADO) ---
const LIFI_API = "https://li.quest/v1";

// --- JUPITER SOLANA (PAUSADO) ---
const JUPITER_API = "https://quote-api.jup.ag/v6";
*/

// =============================================================================
// MAPA DE DIRECCIONES DE COMISIÓN POR RED EVM
// =============================================================================
const feeAddressesByChain: Record<number, string> = {
  1: '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F',      // Ethereum
  56: '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F',     // BNB Chain
  137: '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F',    // Polygon
  42161: '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F',  // Arbitrum
  10: '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F',    // Optimism
  8453: '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F',   // Base
  43114: '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F',  // Avalanche
  202555: '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F', // Kasplex zkEVM
};

export function getFeeAddress(chainId: number): string {
  return feeAddressesByChain[chainId] || feeAddressesByChain[1];
}

const networkNames: Record<number, string> = {
  1: 'Ethereum',
  56: 'BNB Chain',
  137: 'Polygon',
  42161: 'Arbitrum',
  10: 'Optimism',
  8453: 'Base',
  43114: 'Avalanche',
  202555: 'Kasplex zkEVM',
};

export function getNetworkName(chainId: number): string {
  return networkNames[chainId] || 'Unknown';
}

// =============================================================================
// CACHE DE QUOTES
// =============================================================================
const quoteCache = new Map<string, { data: any; timestamp: number }>();
const QUOTE_CACHE_TTL = 10000;

export const NATIVE_ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const USDT_MAINNET = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const USDC_MAINNET = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const WETH_MAINNET = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const NATIVE_BNB = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const NATIVE_MATIC = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const NATIVE_AVAX = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export interface SwapQuote {
  code: number;
  data: {
    inToken: { address: string; decimals: number; symbol: string; usd: string };
    outToken: { address: string; decimals: number; symbol: string; usd: string };
    inAmount: string;
    outAmount: string;
    estimatedGas: number;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    price_impact: string;
  };
}

export function toDecimals(amount: number, decimals: number): string {
  return (amount * Math.pow(10, decimals)).toString();
}

export async function getSwapQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string,
  fee: number = 0.3
): Promise<SwapQuote> {
  const url = `${OPENOCEAN_API}/${chainId}/swap?inTokenAddress=${fromToken}&outTokenAddress=${toToken}&amountDecimals=${amount}&gasPriceDecimals=1000000000&slippage=1&account=${userAddress}&referrer=${REFERRER_ADDRESS}&referrerFee=${fee}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.code !== 200) {
    throw new Error(`OpenOcean error: ${data.msg || 'Unknown error'}`);
  }
  
  return data;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  chainId: number;
}

const KNOWN_TOKENS: Record<string, TokenInfo> = {
  // Ethereum Mainnet
  ETH: { address: NATIVE_ETH, symbol: "ETH", decimals: 18, name: "Ethereum", chainId: 1 },
  BTC: { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "BTC", decimals: 8, name: "Bitcoin", chainId: 1 },
  USDT: { address: USDT_MAINNET, symbol: "USDT", decimals: 6, name: "Tether USD", chainId: 1 },
  USDC: { address: USDC_MAINNET, symbol: "USDC", decimals: 6, name: "USD Coin", chainId: 1 },
  WETH: { address: WETH_MAINNET, symbol: "WETH", decimals: 18, name: "Wrapped Ether", chainId: 1 },
  LINK: { address: "0x514910771AF9Ca656af840dff83E8264EcF986DA", symbol: "LINK", decimals: 18, name: "Chainlink", chainId: 1 },
  UNI: { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI", decimals: 18, name: "Uniswap", chainId: 1 },
  "1INCH": { address: "0x1111111254EEB25477B68fb85Ed929f7A07FFE2B", symbol: "1INCH", decimals: 18, name: "1inch", chainId: 1 },
  
  // BNB Chain
  BNB: { address: NATIVE_BNB, symbol: "BNB", decimals: 18, name: "BNB", chainId: 56 },
  BUSD: { address: "0xe9e7CEA53D20a09D4938AEC366605b548", symbol: "BUSD", decimals: 18, name: "Binance USD", chainId: 56 },
  CAKE: { address: "0x0E09FaBB73Bd3Ade0a17ECC321d24a02e9aF8", symbol: "CAKE", decimals: 18, name: "PancakeSwap", chainId: 56 },
  
  // Polygon
  MATIC: { address: NATIVE_MATIC, symbol: "MATIC", decimals: 18, name: "Polygon", chainId: 137 },
  WMATIC: { address: "0x0d500B1d8E8eF31E21C73d9a0d89a4E96932E91C", symbol: "WMATIC", decimals: 18, name: "Wrapped Matic", chainId: 137 },
  
  // Arbitrum
  ARB: { address: "0x912CE59144191C1204E64559FE8253a0e01E887C", symbol: "ARB", decimals: 18, name: "Arbitrum", chainId: 42161 },
  
  // Base
  BASE: { address: NATIVE_ETH, symbol: "ETH", decimals: 18, name: "Ethereum", chainId: 8453 },
  
  // Avalanche
  AVAX: { address: NATIVE_AVAX, symbol: "AVAX", decimals: 18, name: "Avalanche", chainId: 43114 },
  
  // Kasplex zkEVM
  KAS: { address: NATIVE_ETH, symbol: "KAS", decimals: 18, name: "Kaspa", chainId: 202555 },
};

export function getTokenBySymbol(symbol: string): TokenInfo | null {
  const upper = symbol.toUpperCase();
  return KNOWN_TOKENS[upper] ?? null;
}

export interface SwapResult {
  to: string;
  data: string;
  value: string;
}

export interface SolanaQuoteResponse {
  quoteResponse: {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
  };
}

// =============================================================================
// GETMULTICHAINQUOTE - USA SOLO OPENOCEAN V4
// =============================================================================
export async function getMultiChainQuote(
  srcToken: string,
  dstToken: string,
  amountWei: string,
  fromAddress: string,
  chainId: number = 1,
  isIndex: boolean = false
): Promise<{ quote: SwapResult; provider: string }> {
  const cacheKey = `${chainId}-${srcToken}-${dstToken}-${amountWei}`;
  const cached = quoteCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < QUOTE_CACHE_TTL) {
    return cached.data;
  }

  const feeBps = isIndex ? Math.round(INDEX_FEE * 100) : Math.round(TOP100_FEE * 100);
  const feeAddress = getFeeAddress(chainId);
  
  // Mapeo de tokens a direcciones conocidas
  const srcTokenMapped = getTokenBySymbol(srcToken)?.address || srcToken;
  const dstTokenMapped = getTokenBySymbol(dstToken)?.address || dstToken;
  
  // Mapeo de chain ID para OpenOcean
  const ooChainId = chainId.toString();
  
  const ooUrl = `${OPENOCEAN_API}/${ooChainId}/swap?inTokenAddress=${srcTokenMapped}&outTokenAddress=${dstTokenMapped}&amountDecimals=${amountWei}&gasPriceDecimals=1000000000&slippage=1&account=${fromAddress}&referrer=${feeAddress}&referrerFee=${feeBps / 100}`;
  
  try {
    const response = await fetch(ooUrl);
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error(`OpenOcean error: ${data.msg || 'Unknown error'}`);
    }
    
    const result = {
      quote: {
        to: data.data.to,
        data: data.data.data,
        value: data.data.value || "0"
      },
      provider: "OpenOcean V4"
    };
    
    quoteCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('OpenOcean API Error:', error);
    throw error;
  }
}

// =============================================================================
// LEGACY FUNCTION - USA OPENOCEAN V4
// =============================================================================
export async function getQuote(
  srcTokenAddress: string,
  dstTokenAddress: string,
  amountWei: string,
  chainId = 1,
  userAddress: string
): Promise<SwapQuote> {
  return getSwapQuote(chainId, srcTokenAddress, dstTokenAddress, amountWei, userAddress, TOP100_FEE);
}

// =============================================================================
// APPROVAL Y EJECUCIÓN DE SWAP
// =============================================================================

export async function checkAllowance(
  tokenAddress: string,
  walletAddress: string,
  chainId = 1,
  provider?: BrowserProvider
): Promise<number> {
  try {
    if (!provider) {
      provider = new ethers.BrowserProvider(window.ethereum);
    }
    
    const tokenContract = new Contract(
      tokenAddress,
      ["function allowance(address owner, address spender) view returns (uint256)"],
      provider
    );
    
    const allowance = await tokenContract.allowance(walletAddress, getFeeAddress(chainId));
    return Number(formatUnits(allowance, 18));
  } catch (error) {
    console.error('Error checking allowance:', error);
    return 0;
  }
}

export async function getApproveTx(
  tokenAddress: string,
  amount: string,
  chainId = 1,
  provider?: BrowserProvider
): Promise<{ to: string; data: string; value: string }> {
  try {
    if (!provider) {
      provider = new ethers.BrowserProvider(window.ethereum);
    }
    
    const tokenContract = new Contract(
      tokenAddress,
      ["function approve(address spender, uint256 amount) returns (bool)"],
      provider
    );
    
    const feeAddress = getFeeAddress(chainId);
    const approveAmount = parseUnits(amount, 18);
    
    const tx = await tokenContract.approve.populateTransaction(feeAddress, approveAmount);
    return {
      to: tx.to || "",
      data: tx.data || "",
      value: (tx.value ?? "0").toString()
    };
  } catch (error) {
    console.error('Error getting approve transaction:', error);
    throw error;
  }
}

export async function executeEVMSwap(
  signer: JsonRpcSigner,
  srcToken: TokenInfo,
  dstToken: TokenInfo,
  usdAmount: number,
  ethPrice: number,
  chainId: number = 1
): Promise<string> {
  try {
    const amountEth = usdAmount / ethPrice;
    const amountWei = parseUnits(Math.max(amountEth, 0.00001).toFixed(18), 18);
    
    const quote = await getSwapQuote(
      chainId,
      srcToken.address,
      dstToken.address,
      amountWei.toString(),
      await signer.getAddress(),
      TOP100_FEE
    );
    
    const tx = await signer.sendTransaction({
      to: quote.data.to,
      data: quote.data.data,
      value: quote.data.value || "0"
    });
    
    return tx.hash;
  } catch (error) {
    console.error('Swap execution error:', error);
    throw error;
  }
}

export async function getSolanaQuote(
  inputMint: string,
  outputMint: string,
  amount: string,
): Promise<SolanaQuoteResponse> {
  return {
    quoteResponse: {
      inputMint,
      outputMint,
      inAmount: amount,
      outAmount: amount,
    },
  };
}

export async function executeSolanaSwap(
  wallet: SolanaWalletState,
  _quoteResponse: SolanaQuoteResponse["quoteResponse"],
): Promise<string> {
  const connection = new Connection(solanaEndpoint, "confirmed");
  return wallet.sendTransaction(new Transaction(), connection);
}
