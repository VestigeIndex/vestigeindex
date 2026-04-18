import { PhantomWalletAdapter, TrustWalletAdapter } from '@solana/wallet-adapter-wallets';

export const solanaWallets = [
  new PhantomWalletAdapter(),
  new TrustWalletAdapter(),
];