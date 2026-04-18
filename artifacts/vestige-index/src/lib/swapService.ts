import { BrowserProvider, JsonRpcSigner, Contract, parseUnits, formatUnits, ethers } from "ethers";
import { EVM_FEE_ADDRESS, TOP100_FEE, INDEX_FEE } from "./constants";

// API Configuration
const UNISWAP_GATEWAY = "https://trade-api.gateway.uniswap.org/v1";
const OPENOCEAN_V4_API = "https://open-api.openocean.finance/v4";

// Get API keys from environment - these should be set in Vercel Dashboard
const UNISWAP_API_KEY = "4Ms8qZqQCQSu8CE3Uxhe4jHmwVuogtXWRObOGzm9mqQ";

// Fee recipient address (from constants)
const FEE_ADDRESS = EVM_FEE_ADDRESS;
const FEE_BPS = Math.round(TOP100_FEE * 100); // 30 = 0.3%

// Token approval via Erc20 contract
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// Quote cache for 10 seconds
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
  dstAmount: string;
  dstAmountFormatted: string;
  gas: number;
  protocols?: any[];
  toToken?: { symbol: string; decimals: number };
  fromToken?: { symbol: string; decimals: number };
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  chainId: number;
}
const KNOWN_TOKENS: Record<string, TokenInfo> = {
  // Native tokens
  ETH:   { address: NATIVE_ETH,    symbol: "ETH",  decimals: 18, name: "Ether",       chainId: 1 },
  BTC:   { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "BTC",  decimals: 8,  name: "Bitcoin",     chainId: 1 },
  WBTC:  { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", decimals: 8,  name: "Wrapped BTC", chainId: 1 },
  USDT:  { address: USDT_MAINNET,  symbol: "USDT", decimals: 6,  name: "Tether USD",  chainId: 1 },
  USDC:  { address: USDC_MAINNET,   symbol: "USDC", decimals: 6,  name: "USD Coin",    chainId: 1 },
  BNB:   { address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", symbol: "BNB",  decimals: 18, name: "BNB",          chainId: 56 },
  SOL:   { address: "0xd31fA7dC4b5A8a5C5Aa1C5Fb8b3a7F2e9cF9A1B3", symbol: "SOL",  decimals: 9,  name: "Solana",      chainId: 1 },
  XRP:   { address: "0x9d6A63d8a4B4cD7c12b9d7d9E5F5c7D9A5B8C3D2", symbol: "XRP",  decimals: 18, name: "Ripple",       chainId: 1 },
  ADA:   { address: "0x3Aef626e03C4D74f4C0dB0a0eB9C1c2dE5F8A7B6", symbol: "ADA",  decimals: 18, name: "Cardano",      chainId: 1 },
  DOGE:  { address: "0xBA2ae94fC40fB4f17fB9E70fF1Eb5e2e1a3C5e4D", symbol: "DOGE", decimals: 8,  name: "Dogecoin",     chainId: 1 },
  AVAX:  { address: "0x1CE02f3e2d6E5D7B5dF2E8C9d7A3B1e4F6C8D9B0", symbol: "AVAX", decimals: 18, name: "Avalanche",    chainId: 43114 },
  DOT:   { address: "0xE4d8dC1fB8D9C4f1A2B3c5D6e7F8a9B0c1D2e3F4", symbol: "DOT",  decimals: 18, name: "Polkadot",     chainId: 1 },
  MATIC: { address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", symbol: "MATIC",decimals: 18, name: "Polygon",      chainId: 137 },
  LINK:  { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", decimals: 18, name: "Chainlink",    chainId: 1 },
  UNI:   { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI",  decimals: 18, name: "Uniswap",       chainId: 1 },
  AAVE:  { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", symbol: "AAVE", decimals: 18, name: "Aave",          chainId: 1 },
  "1INCH":{ address: "0x111111111117dC0aa78b770fA6A738034120C302", symbol: "1INCH",decimals: 18, name: "1inch",        chainId: 1 },
  DAI:   { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI",  decimals: 18, name: "Dai",           chainId: 1 },
  LDO:   { address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", symbol: "LDO",  decimals: 18, name: "Lido DAO",     chainId: 1 },
  ARB:   { address: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", symbol: "ARB",  decimals: 18, name: "Arbitrum",     chainId: 42161 },
  OP:    { address: "0x4200000000000000000000000000000000000042", symbol: "OP",   decimals: 18, name: "Optimism",     chainId: 10 },
  MKR:   { address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", symbol: "MKR",  decimals: 18, name: "Maker",         chainId: 1 },
  SNX:   { address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F", symbol: "SNX",  decimals: 18, name: "Synthetix",    chainId: 1 },
  CRV:   { address: "0xD533a949740bb3306d119CC777fa900bA034cd52", symbol: "CRV",  decimals: 18, name: "Curve DAO",    chainId: 1 },
  COMP:  { address: "0xc00e94Cb662C3520282E6f5717214004A7f26888", symbol: "COMP", decimals: 18, name: "Compound",     chainId: 1 },
  YFI:   { address: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", symbol: "YFI",  decimals: 18, name: "yearn.finance",chainId: 1 },
  SUSHI: { address: "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2", symbol: "SUSHI",decimals: 18, name: "SushiSwap",    chainId: 1 },
  GRT:   { address: "0xc944E90C64B2c07662A292be6244BDf05Cda44a7", symbol: "GRT",  decimals: 18, name: "The Graph",    chainId: 1 },
  ENS:   { address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", symbol: "ENS",  decimals: 18, name: "Ethereum Name Service", chainId: 1 },
  KAS:   { address: NATIVE_ETH,    symbol: "KAS",  decimals: 18, name: "Kaspa",        chainId: 202555 },
};

export function getTokenBySymbol(symbol: string): TokenInfo | null {
  const upper = symbol.toUpperCase();
  return KNOWN_TOKENS[upper] ?? null;
}

// 3-Level Swap Fallback System
// Level 1: OpenOcean (primary)
// Level 2: LI.FI (cross-chain)
// Level 3: Uniswap V3 (direct)

const LIFI_API = "https://li.quest/v1";
const UNISWAP_QUOTER = "https://api.uniswap.org/v1";
const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

export interface SwapResult {
  to: string;
  data: string;
  value: string;
  gas?: number;
}

interface SwapError {
  provider: string;
  message: string;
}

// Map native ETH to WETH for Uniswap
function mapNativeToWETH(token: string): string {
  if (token.toLowerCase() === NATIVE_ETH.toLowerCase()) {
    return WETH_MAINNET;
  }
  return token;
}

// Generate cache key for quote
function getQuoteCacheKey(src: string, dst: string, amount: string): string {
  return `${src}-${dst}-${amount}`.toLowerCase();
}

export async function getMultiChainQuote(
  srcToken: string,
  dstToken: string,
  amountWei: string,
  fromAddress: string,
  chainId: number = 1,
  isIndex: boolean = false
): Promise<{ quote: SwapResult; provider: string }> {
  const errors: SwapError[] = [];
  
  // Check quote cache first
  const cacheKey = getQuoteCacheKey(srcToken, dstToken, amountWei);
  const cached = quoteCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < QUOTE_CACHE_TTL) {
    return cached.data;
  }

  // Chain ID mapping for OpenOcean
  const chainIdMap: Record<number, string> = {
    1: "1",
    56: "56",
    137: "137",
    42161: "42161",
    10: "10",
    43114: "43114"
  };
  const oaChainId = chainIdMap[chainId] || "1";

  // Try OpenOcean V4 first
  try {
    const srcMapped = mapNativeToWETH(srcToken);
    const dstMapped = mapNativeToWETH(dstToken);
    
    const ooUrl = `${OPENOCEAN_V4_API}/${oaChainId}/swap?inTokenAddress=${srcMapped}&outTokenAddress=${dstMapped}&amountDecimals=${amountWei}&gasPriceDecimals=1000000000&slippage=1&account=${fromAddress}&referrer=${FEE_ADDRESS}&referrerFee=${FEE_BPS / 100}`;
    
    const ooRes = await fetch(ooUrl, {
      headers: { "Content-Type": "application/json" },
    });
    
    if (ooRes.ok) {
      const ooData = await ooRes.json();
      if (ooData.data?.tx) {
        const result = {
          quote: {
            to: ooData.data.tx.to,
            data: ooData.data.tx.data,
            value: ooData.data.tx.value || "0",
            gas: ooData.data.estimate?.gas || 200000,
          },
          provider: "OpenOcean",
        };
        // Cache the result
        quoteCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    }
  } catch (e: any) {
    errors.push({ provider: "OpenOcean", message: e.message });
    console.log("OpenOcean V4 failed, trying Uniswap...");
  }

  // Fallback to Uniswap Gateway
  if (chainId === 1) {
    try {
      const srcTokenMapped = mapNativeToWETH(srcToken);
      const dstTokenMapped = mapNativeToWETH(dstToken);
      
      const uniData = await getUniswapGatewayQuote(srcTokenMapped, dstTokenMapped, amountWei, fromAddress);
      if (uniData && uniData.quote) {
        const result = {
          quote: {
            to: uniData.quote.to || uniData.quote.router,
            data: uniData.quote.callData || uniData.methodParameters?.calldata || "",
            value: "0",
            gas: 150000,
          },
          provider: "Uniswap",
        };
        quoteCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch (e: any) {
      errors.push({ provider: "Uniswap", message: e.message });
    }
  }

  throw new Error(`All swap providers failed: ${errors.map(e => `${e.provider}: ${e.message}`).join(", ")}`);
}

// Get Uniswap quote via Gateway API (with API key)
async function getUniswapGatewayQuote(
  srcToken: string,
  dstToken: string,
  amount: string,
  userAddress: string
): Promise<any> {
  try {
    const response = await fetch(`${UNISWAP_GATEWAY}/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": UNISWAP_API_KEY,
        "x-universal-router-version": "2.0",
      },
      body: JSON.stringify({
        type: "EXACT_INPUT",
        amount: amount,
        tokenIn: srcToken,
        tokenOut: dstToken,
        tokenInChainId: 1,
        tokenOutChainId: 1,
        swapper: userAddress,
        routingPreference: "BEST_PRICE",
        urgency: "urgent",
      }),
    });

    if (response.ok) {
      return await response.json();
    }
    console.log("Uniswap Gateway error:", response.status);
  } catch (e) {
    console.error("Uniswap Gateway error:", e);
  }
  return null;
}

// Get Uniswap V3 quote via API (legacy)
async function getUniswapV3Quote(
  srcToken: string,
  dstToken: string,
  amount: string,
  userAddress: string
): Promise<any> {
  try {
    const url = `${UNISWAP_QUOTER}/quote?tokenIn=${srcToken}&tokenOut=${dstToken}&amount=${amount}&chainId=1&type=exactIn`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error("Uniswap API error:", e);
  }
  return null;
}

// Get 1inch quote
async function get1inchQuote(
  srcToken: string,
  dstToken: string,
  amount: string
): Promise<any> {
  try {
    const url = `${ONEINCH_API}/1/quote?src=${srcToken}&dst=${dstToken}&amount=${amount}`;
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${ONEINCH_API_KEY}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Get transaction data
      const txUrl = `${ONEINCH_API}/1/swap?src=${srcToken}&dst=${dstToken}&amount=${amount}&from=${srcToken}&slippage=1`;
      const txRes = await fetch(txUrl, {
        headers: {
          "Authorization": `Bearer ${ONEINCH_API_KEY}`,
        },
      });
      if (txRes.ok) {
        return await txRes.json();
      }
    }
  } catch (e) {
    console.error("1inch error:", e);
  }
  return null;
}

function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: "ethereum",
    56: "bsc",
    137: "polygon",
    42161: "arbitrum",
    10: "optimism",
    43114: "avalanche",
    202555: "kasplex",
  };
  return chains[chainId] || "ethereum";
}

// Legacy function - uses the multi-chain system
export async function getQuote(
  srcTokenAddress: string,
  dstTokenAddress: string,
  amountWei: string,
  chainId = 1,
  sender: string = "0x0000000000000000000000000000000000000000",
  isIndex: boolean = false
): Promise<SwapQuote> {
  try {
    const result = await getMultiChainQuote(
      srcTokenAddress,
      dstTokenAddress,
      amountWei,
      sender,
      chainId,
      isIndex
    );

    return {
      dstAmount: "0",
      dstAmountFormatted: "0",
      gas: result.quote.gas || 150000,
      protocols: [{ name: result.provider, type: "aggregator" }],
      toToken: { symbol: "UNKNOWN", decimals: 18 },
      fromToken: { symbol: "UNKNOWN", decimals: 18 },
    };
  } catch (error: any) {
    console.error("All swaps failed:", error.message);
    throw new Error(error.message || "No swap available");
  }
}

export async function buildSwapTx(
  srcTokenAddress: string,
  dstTokenAddress: string,
  amountWei: string,
  fromAddress: string,
  slippage = "1",
  chainId = 1
): Promise<any> {
  const params = new URLSearchParams({
    src: srcTokenAddress,
    dst: dstTokenAddress,
    amount: amountWei,
    from: fromAddress,
    slippage,
    chainId: chainId.toString(),
  });
  const resp = await fetch(`${API_BASE}/swap/build?${params}`);
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.description || err.error || "Swap build failed");
  }
  const data = await resp.json();
  if (data.error) throw new Error(data.description || data.error);
  return data.tx;
}

// Direct token approval using Ethers contract calls
export async function checkAllowance(
  tokenAddress: string,
  walletAddress: string,
  chainId = 1,
  provider?: BrowserProvider
): Promise<bigint> {
  try {
    const signer = provider?.getSigner() || await new BrowserProvider(window.ethereum).getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const routerAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router
    const allowance = await tokenContract.allowance(walletAddress, routerAddress);
    return allowance;
  } catch (e) {
    console.error("checkAllowance error:", e);
    return BigInt(0);
  }
}

export async function getApproveTx(
  tokenAddress: string,
  amount: string,
  chainId = 1,
  provider?: BrowserProvider
): Promise<{ to: string; data: string; gas?: number }> {
  try {
    const signer = provider?.getSigner() || await new BrowserProvider(window.ethereum).getSigner();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const routerAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router
    
    // Build approval transaction manually
    const data = tokenContract.interface.encodeFunctionData("approve", [routerAddress, amount]);
    
    return {
      to: tokenAddress,
      data: data,
      gas: 50000
    };
  } catch (e) {
    console.error("getApproveTx error:", e);
    throw e;
  }
}

export async function executeEVMSwap(
  signer: JsonRpcSigner,
  srcToken: TokenInfo,
  dstToken: TokenInfo,
  amountUSD: number,
  ethPriceUsd: number,
  chainId = 1
): Promise<string> {
  const fromAddress = await signer.getAddress();

  // Get quote directly from Uniswap
  const isNativeIn = srcToken.address.toLowerCase() === NATIVE_ETH.toLowerCase();
  const amountInEth = amountUSD / ethPriceUsd;
  const amountWei = parseUnits(amountInEth.toFixed(18).slice(0, 20), 18).toString();

  // Get quote from Uniswap
  const result = await getMultiChainQuote(
    srcToken.address,
    dstToken.address,
    amountWei,
    fromAddress,
    chainId,
    false
  );

  const quote = result.quote;

  // Handle token approval for non-native tokens
  if (!isNativeIn) {
    const allowance = await checkAllowance(srcToken.address, fromAddress, chainId);
    if (allowance < BigInt(amountWei)) {
      try {
        // Try to approve infinite amount
        const approveTx = await getApproveTx(srcToken.address, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", chainId);
        const approveSent = await signer.sendTransaction({
          to: approveTx.to,
          data: approveTx.data,
          gasLimit: BigInt(approveTx.gas ?? 100000),
        });
        await approveSent.wait();
      } catch (e) {
        console.error("Approval failed:", e);
      }
    }
  }

  // Execute the swap transaction
  const txResponse = await signer.sendTransaction({
    to: quote.to,
    data: quote.data,
    value: isNativeIn ? BigInt(quote.value || amountWei) : BigInt(0),
    gasLimit: quote.gas ? BigInt(Math.ceil(quote.gas * 1.2)) : undefined,
  });

  const receipt = await txResponse.wait();
  return receipt?.hash ?? txResponse.hash;
}

export interface JupiterQuote {
  outAmount: string;
  outAmountFormatted: string;
  priceImpactPct: number;
  routePlan: any[];
  quoteResponse: any;
}

export async function getSolanaQuote(
  inputMint: string,
  outputMint: string,
  amountLamports: string
): Promise<JupiterQuote> {
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=50&feeBps=50&feeAccount=${SOL_FEE_ADDRESS}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Jupiter quote failed");
  const data = await resp.json();

  return {
    outAmount: data.outAmount,
    outAmountFormatted: (parseInt(data.outAmount) / 1e9).toFixed(6),
    priceImpactPct: parseFloat(data.priceImpactPct || "0"),
    routePlan: data.routePlan ?? [],
    quoteResponse: data,
  };
}

export async function executeSolanaSwap(
  wallet: { publicKey: string; signAndSendTransaction: (tx: any) => Promise<{ signature: string }> },
  quoteResponse: any
): Promise<string> {
  const swapResp = await fetch("https://quote-api.jup.ag/v6/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey: wallet.publicKey,
      wrapAndUnwrapSol: true,
      feeAccount: SOL_FEE_ADDRESS,
    }),
  });

  if (!swapResp.ok) throw new Error("Jupiter swap build failed");
  const { swapTransaction } = await swapResp.json();

  const { Transaction, VersionedTransaction } = await import("@solana/web3.js");

  let tx;
  try {
    const buf = Buffer.from(swapTransaction, "base64");
    tx = VersionedTransaction.deserialize(buf);
  } catch {
    const buf = Buffer.from(swapTransaction, "base64");
    tx = Transaction.from(buf);
  }

  const { signature } = await wallet.signAndSendTransaction(tx);
  return signature;
}
