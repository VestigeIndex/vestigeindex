import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

const WALLETS = [
  { name: 'MetaMask', logo: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/Icon/metamask-icon.svg', type: 'evm' },
  { name: 'Trust Wallet', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png', type: 'evm' },
  { name: 'Phantom', logo: 'https://raw.githubusercontent.com/phantom/solana-brand-assets/main/logo/Phantom%20Logo%20Mark%20(Blue).svg', type: 'solana' },
  { name: 'WalletConnect', logo: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Blue.png', type: 'evm' },
  { name: 'Coinbase', logo: 'https://raw.githubusercontent.com/coinbase/wallet-mobile/master/src/assets/images/icon.png', type: 'evm' },
];

// Estilos CSS incluidos en el mismo archivo
const styles = `
  .wallet-connector { position: relative; }
  .wallet-connector-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #1f2937;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  .wallet-connector-button:hover { background-color: #374151; }
  .wallet-connector-dropdown {
    position: absolute;
    right: 0;
    margin-top: 0.5rem;
    width: 14rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    z-index: 50;
    border: 1px solid #e5e7eb;
  }
  .dark .wallet-connector-dropdown { background-color: #1f2937; border-color: #374151; }
  .wallet-connector-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    width: 100%;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
    background: transparent;
    border: none;
  }
  .wallet-connector-item:hover { background-color: #f3f4f6; }
  .dark .wallet-connector-item:hover { background-color: #374151; }
  .wallet-connector-logo { width: 1.25rem; height: 1.25rem; }
  .wallet-connected {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #dcfce7;
    color: #166534;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
  }
  .dark .wallet-connected { background-color: rgba(34,197,94,0.2); color: #4ade80; }
  .wallet-address { font-family: monospace; font-size: 0.875rem; }
  .wallet-disconnect {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    color: #ef4444;
    cursor: pointer;
    background: none;
    border: none;
  }
  .wallet-disconnect:hover { color: #dc2626; }
`;

// Inyectar estilos (solo una vez)
if (typeof document !== 'undefined') {
  const styleId = 'wallet-connector-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }
}

export function WalletConnector() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { connect: connectSolana, disconnect: disconnectSolana, connected: solanaConnected, publicKey } = useSolanaWallet();

  const handleConnect = (wallet: typeof WALLETS[0]) => {
    setIsOpen(false);
    if (wallet.type === 'evm') {
      const connector = connectors.find(c => c.name === wallet.name);
      if (connector) connect({ connector });
    } else {
      connectSolana();
    }
  };

  const handleDisconnect = () => {
    if (isConnected) disconnect();
    if (solanaConnected) disconnectSolana();
  };

  const isWalletConnected = isConnected || solanaConnected;
  const displayAddress = address || publicKey?.toString();

  return (
    <div className="wallet-connector">
      {!isWalletConnected ? (
        <button className="wallet-connector-button" onClick={() => setIsOpen(!isOpen)}>
          <span>🔌 Conectar Wallet</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <div className="wallet-connected">
          <span className="wallet-address">{displayAddress?.slice(0, 6)}...{displayAddress?.slice(-4)}</span>
          <button className="wallet-disconnect" onClick={handleDisconnect}>✕</button>
        </div>
      )}

      {isOpen && !isWalletConnected && (
        <div className="wallet-connector-dropdown">
          {WALLETS.map((wallet) => (
            <button key={wallet.name} className="wallet-connector-item" onClick={() => handleConnect(wallet)}>
              <img src={wallet.logo} alt={wallet.name} className="wallet-connector-logo" />
              <span>{wallet.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}