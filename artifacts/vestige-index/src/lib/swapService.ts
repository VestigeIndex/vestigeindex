import { BrowserProvider, JsonRpcSigner, parseUnits, formatUnits } from "ethers";
import { SOL_FEE_ADDRESS } from "./constants";

const API_BASE = "/api";

export const NATIVE_ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const USDT_MAINNET = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const USDC_MAINNET = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

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
  ETH:   { address: NATIVE_ETH,    symbol: "ETH",  decimals: 18, name: "Ether",       chainId: 1 },
  USDT:  { address: USDT_MAINNET,  symbol: "USDT", decimals: 6,  name: "Tether USD",  chainId: 1 },
  USDC:  { address: USDC_MAINNET,  symbol: "USDC", decimals: 6,  name: "USD Coin",    chainId: 1 },
  WBTC:  { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", decimals: 8,  name: "Wrapped BTC",  chainId: 1 },
  BNB:   { address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", symbol: "BNB",  decimals: 18, name: "BNB",          chainId: 1 },
  LINK:  { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", decimals: 18, name: "Chainlink",    chainId: 1 },
  UNI:   { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI",  decimals: 18, name: "Uniswap",     chainId: 1 },
  AAVE:  { address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", symbol: "AAVE", decimals: 18, name: "Aave",        chainId: 1 },
  "1INCH":{ address: "0x111111111117dC0aa78b770fA6A738034120C302", symbol: "1INCH",decimals: 18, name: "1inch",       chainId: 1 },
  MATIC: { address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", symbol: "MATIC",decimals: 18, name: "Polygon",     chainId: 1 },
  DAI:   { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI",  decimals: 18, name: "Dai",         chainId: 1 },
  LDO:   { address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", symbol: "LDO",  decimals: 18, name: "Lido DAO",    chainId: 1 },
  ARB:   { address: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", symbol: "ARB",  decimals: 18, name: "Arbitrum",    chainId: 1 },
  MKR:   { address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", symbol: "MKR",  decimals: 18, name: "Maker",       chainId: 1 },
  SNX:   { address: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F", symbol: "SNX",  decimals: 18, name: "Synthetix",  chainId: 1 },
  CRV:   { address: "0xD533a949740bb3306d119CC777fa900bA034cd52", symbol: "CRV",  decimals: 18, name: "Curve DAO",  chainId: 1 },
  COMP:  { address: "0xc00e94Cb662C3520282E6f5717214004A7f26888", symbol: "COMP", decimals: 18, name: "Compound",   chainId: 1 },
  YFI:   { address: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e", symbol: "YFI",  decimals: 18, name: "yearn.finance",chainId: 1 },
  SUSHI: { address: "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2", symbol: "SUSHI",decimals: 18, name: "SushiSwap",  chainId: 1 },
  BAL:   { address: "0xba100000625a3754423978a60c9317c58a424e3D", symbol: "BAL",  decimals: 18, name: "Balancer",    chainId: 1 },
  GRT:   { address: "0xc944E90C64B2c07662A292be6244BDf05Cda44a7", symbol: "GRT",  decimals: 18, name: "The Graph",  chainId: 1 },
  ENS:   { address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", symbol: "ENS",  decimals: 18, name: "Ethereum Name Service", chainId: 1 },
};

export function getTokenBySymbol(symbol: string): TokenInfo | null {
  const upper = symbol.toUpperCase();
  return KNOWN_TOKENS[upper] ?? null;
}

export async function getQuote(
  srcTokenAddress: string,
  dstTokenAddress: string,
  amountWei: string,
  chainId = 1
): Promise<SwapQuote> {
  const params = new URLSearchParams({
    src: srcTokenAddress,
    dst: dstTokenAddress,
    amount: amountWei,
    chainId: chainId.toString(),
  });
  const resp = await fetch(`${API_BASE}/swap/quote?${params}`);
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.description || err.error || "Quote failed");
  }
  const data = await resp.json();
  if (data.error) throw new Error(data.description || data.error);

  const decimals = data.dstToken?.decimals ?? 18;
  const dstAmountFormatted = formatUnits(data.dstAmount, decimals);

  return {
    dstAmount: data.dstAmount,
    dstAmountFormatted,
    gas: data.gas,
    protocols: data.protocols,
    toToken: data.dstToken,
    fromToken: data.srcToken,
  };
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

export async function checkAllowance(
  tokenAddress: string,
  walletAddress: string,
  chainId = 1
): Promise<bigint> {
  const params = new URLSearchParams({ tokenAddress, walletAddress, chainId: chainId.toString() });
  const resp = await fetch(`${API_BASE}/swap/approve/allowance?${params}`);
  const data = await resp.json();
  return BigInt(data.allowance ?? "0");
}

export async function getApproveTx(
  tokenAddress: string,
  amount: string,
  chainId = 1
): Promise<any> {
  const params = new URLSearchParams({ tokenAddress, amount, chainId: chainId.toString() });
  const resp = await fetch(`${API_BASE}/swap/approve/transaction?${params}`);
  return resp.json();
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

  const isNativeIn = srcToken.symbol === "ETH";
  const amountInEth = amountUSD / ethPriceUsd;
  const amountWei = parseUnits(amountInEth.toFixed(18).slice(0, 20), 18).toString();
  const amountTokenWei = parseUnits(
    (amountUSD / (ethPriceUsd || 1)).toFixed(srcToken.decimals).slice(0, srcToken.decimals + 4),
    srcToken.decimals
  ).toString();

  const amountToUse = isNativeIn ? amountWei : amountTokenWei;

  if (!isNativeIn) {
    const allowance = await checkAllowance(srcToken.address, fromAddress, chainId);
    if (allowance < BigInt(amountToUse)) {
      const approveTx = await getApproveTx(srcToken.address, amountToUse, chainId);
      const approveSent = await signer.sendTransaction({
        to: approveTx.to,
        data: approveTx.data,
        gasLimit: BigInt(approveTx.gas ?? 100000),
      });
      await approveSent.wait();
    }
  }

  const tx = await buildSwapTx(
    srcToken.address,
    dstToken.address,
    amountToUse,
    fromAddress,
    "1",
    chainId
  );

  const txResponse = await signer.sendTransaction({
    to: tx.to,
    data: tx.data,
    value: isNativeIn ? BigInt(amountToUse) : BigInt(0),
    gasLimit: tx.gas ? BigInt(Math.ceil(tx.gas * 1.2)) : undefined,
    gasPrice: tx.gasPrice ? BigInt(tx.gasPrice) : undefined,
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
