// Wallet logo URLs - using official/correct logos
export const WALLET_LOGOS = {
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  trust: "https://cryptologos.cc/logos/trust-wallet-trust-logo.svg",
  phantom: "https://cryptologos.cc/logos/phantom-phantom-logo.svg",
  walletconnect: "https://cryptologos.cc/logos/walletconnect-wc-logo.svg",
  coinbase: "https://cryptologos.cc/logos/coinbase-coin-logo.svg",
};

export const WALLETS = [
  { id: 'metamask', name: 'MetaMask', type: 'evm' },
  { id: 'trust', name: 'Trust Wallet', type: 'evm' },
  { id: 'coinbase', name: 'Coinbase Wallet', type: 'evm' },
  { id: 'walletconnect', name: 'WalletConnect', type: 'evm' },
  { id: 'phantom', name: 'Phantom', type: 'solana' },
] as const;

export type WalletId = typeof WALLETS[number]['id'];