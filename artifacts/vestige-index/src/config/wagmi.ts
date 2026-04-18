import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { mainnet, bsc, polygon, arbitrum, optimism, base } from 'wagmi/chains';

// WalletConnect Project ID
export const projectId = '9b39025ad1e21900725d77ef50a908cd';

export const chains = [mainnet, bsc, polygon, arbitrum, optimism, base];

const { connectors } = getDefaultWallets({
  appName: 'Vestige Index',
  projectId,
  chains
});

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
});