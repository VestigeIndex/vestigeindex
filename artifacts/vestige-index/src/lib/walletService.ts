import { BrowserProvider, JsonRpcSigner } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

export interface EVMWallet {
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  address: string;
  chainId: number;
}

export interface SolanaWallet {
  publicKey: string;
  signTransaction: (tx: any) => Promise<any>;
  signAndSendTransaction: (tx: any) => Promise<{ signature: string }>;
}

export async function connectMetaMask(): Promise<EVMWallet> {
  if (!window.ethereum) {
    throw new Error("MetaMask no encontrado. Instala la extension MetaMask.");
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  return { provider, signer, address, chainId };
}

export async function connectCoinbase(): Promise<EVMWallet> {
  if (!window.ethereum) {
    throw new Error("No se encontro una wallet EVM compatible. Instala MetaMask o Coinbase Wallet.");
  }

  const provider = new BrowserProvider(window.ethereum);

  if (window.ethereum.providers) {
    const coinbaseProvider = window.ethereum.providers.find((p: any) => p.isCoinbaseWallet);
    if (coinbaseProvider) {
      const cbProvider = new BrowserProvider(coinbaseProvider);
      await cbProvider.send("eth_requestAccounts", []);
      const signer = await cbProvider.getSigner();
      const address = await signer.getAddress();
      const network = await cbProvider.getNetwork();
      return { provider: cbProvider, signer, address, chainId: Number(network.chainId) };
    }
  }

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  return { provider, signer, address, chainId: Number(network.chainId) };
}

export async function connectPhantom(): Promise<SolanaWallet> {
  if (!window.solana) {
    throw new Error("Phantom no encontrado. Instala la extension Phantom Wallet.");
  }
  if (!window.solana.isPhantom) {
    throw new Error("La wallet encontrada no es Phantom. Instala Phantom Wallet.");
  }

  const response = await window.solana.connect();
  const publicKey = response.publicKey.toString();

  return {
    publicKey,
    signTransaction: (tx: any) => window.solana.signTransaction(tx),
    signAndSendTransaction: (tx: any) => window.solana.signAndSendTransaction(tx),
  };
}

export async function switchToEthereumMainnet(provider: BrowserProvider): Promise<void> {
  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: "0x1" }]);
  } catch {
  }
}

export function getEVMWallet(): EVMWallet | null {
  return (window as any).__evmWallet ?? null;
}

export function getSolanaWallet(): SolanaWallet | null {
  return (window as any).__solWallet ?? null;
}

export function storeEVMWallet(w: EVMWallet) {
  (window as any).__evmWallet = w;
}

export function storeSolanaWallet(w: SolanaWallet) {
  (window as any).__solWallet = w;
}
