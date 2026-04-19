import { useAccount as useEvmAccount } from 'wagmi';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

export function useWallet() {
  const { address: evmAddress, isConnected: isEvmConnected } = useEvmAccount();
  const { connected: isSolanaConnected, publicKey } = useSolanaWallet();

  const isConnected = isEvmConnected || isSolanaConnected;
  const address = evmAddress || publicKey?.toString() || null;
  const chainType = evmAddress ? 'evm' : (publicKey ? 'solana' : null);

  return { isConnected, address, chainType };
}