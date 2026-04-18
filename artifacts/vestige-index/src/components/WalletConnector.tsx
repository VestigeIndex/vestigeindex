import { ConnectButton } from '@rainbow-me/rainbowkit';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Estilos minimalistas, solo para unificar tamaño y espaciado
const styles = `
  .vestige-wallet-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  /* Estilo para el botón de RainbowKit (EVM) */
  .vestige-wallet-group .rainbowkit-button {
    background-color: #1f2937 !important;
    border-radius: 0.5rem !important;
    padding: 0.4rem 0.8rem !important;
    font-size: 0.75rem !important;
    font-weight: 500 !important;
    transition: all 0.2s !important;
  }
  .vestige-wallet-group .rainbowkit-button:hover {
    background-color: #374151 !important;
  }
  /* Estilo para el botón de Solana (Phantom) */
  .vestige-wallet-group .wallet-multi-button {
    background-color: #1f2937 !important;
    border-radius: 0.5rem !important;
    padding: 0.4rem 0.8rem !important;
    font-size: 0.75rem !important;
    font-weight: 500 !important;
    transition: all 0.2s !important;
  }
  .vestige-wallet-group .wallet-multi-button:hover {
    background-color: #374151 !important;
  }
  /* Cuando está conectado */
  .vestige-wallet-group .rainbowkit-connected,
  .vestige-wallet-group .wallet-connected {
    background-color: #dcfce7 !important;
    color: #166534 !important;
    border-radius: 0.5rem !important;
    padding: 0.4rem 0.8rem !important;
    font-size: 0.75rem !important;
  }
  .dark .vestige-wallet-group .rainbowkit-connected,
  .dark .vestige-wallet-group .wallet-connected {
    background-color: rgba(34, 197, 94, 0.2) !important;
    color: #4ade80 !important;
  }
`;

// Inyectar estilos (solo una vez)
if (typeof document !== 'undefined') {
  const styleId = 'vestige-wallet-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }
}

export function WalletConnector() {
  return (
    <div className="vestige-wallet-group">
      {/* EVM Wallets: MetaMask, Trust Wallet, Coinbase, WalletConnect */}
      <ConnectButton 
        chainStatus="icon"
        showBalance={{ smallScreen: false, largeScreen: false }}
      />
      {/* Solana Wallet: Phantom */}
      <WalletMultiButton />
    </div>
  );
}