import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';

// LOGOS ORIGINALES (CDNs oficiales que funcionan)
const WALLETS = [
  { name: 'MetaMask', logo: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/Icon/metamask-icon.svg', type: 'evm', connectorName: 'MetaMask' },
  { name: 'Trust Wallet', logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png', type: 'evm', connectorName: 'Trust Wallet' },
  { name: 'Phantom', logo: 'https://raw.githubusercontent.com/phantom/solana-brand-assets/main/logo/Phantom%20Logo%20Mark%20(Blue).svg', type: 'solana', connectorName: 'Phantom' },
  { name: 'WalletConnect', logo: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Blue.png', type: 'evm', connectorName: 'WalletConnect' },
  { name: 'Coinbase Wallet', logo: 'https://raw.githubusercontent.com/coinbase/wallet-mobile/master/src/assets/images/icon.png', type: 'evm', connectorName: 'Coinbase Wallet' },
];

// CSS personalizado (solo para este componente)
const styles = `
  .vestige-wallet-container { position: relative; }
  .vestige-wallet-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #1f2937;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s;
  }
  .vestige-wallet-button:hover { background-color: #374151; }
  .vestige-wallet-dropdown {
    position: absolute;
    right: 0;
    margin-top: 0.5rem;
    width: 240px;
    background-color: white;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    border: 1px solid #e5e7eb;
    z-index: 50;
    overflow: hidden;
  }
  .dark .vestige-wallet-dropdown { background-color: #1f2937; border-color: #374151; }
  .vestige-wallet-item {
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
  .vestige-wallet-item:hover { background-color: #f3f4f6; }
  .dark .vestige-wallet-item:hover { background-color: #374151; }
  .vestige-wallet-logo { width: 1.25rem; height: 1.25rem; object-fit: contain; }
  .vestige-wallet-connected {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #dcfce7;
    color: #166534;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
  }
  .dark .vestige-wallet-connected { background-color: rgba(34,197,94,0.2); color: #4ade80; }
  .vestige-wallet-address { font-family: monospace; font-size: 0.875rem; }
  .vestige-wallet-disconnect {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    color: #ef4444;
    cursor: pointer;
    background: none;
    border: none;
  }
  .vestige-wallet-disconnect:hover { color: #dc2626; }
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
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { connect: connectSolana, disconnect: disconnectSolana, connected: solanaConnected, publicKey, select, wallets: solanaWallets } = useSolanaWallet();

  const handleConnect = async (wallet: typeof WALLETS[0]) => {
    setIsOpen(false);
    if (wallet.type === 'evm') {
      const connector = connectors.find(c => c.name === wallet.connectorName);
      if (connector) connect({ connector });
      else console.error(`Connector ${wallet.name} not found`);
    } else if (wallet.type === 'solana') {
      const solanaWallet = solanaWallets.find(w => w.adapter.name === wallet.connectorName);
      if (solanaWallet) { select(solanaWallet.adapter.name); await connectSolana(); }
      else console.error(`Solana wallet ${wallet.name} not found`);
    }
  };

  const handleDisconnect = () => { if (isConnected) disconnect(); if (solanaConnected) disconnectSolana(); };

  const isWalletConnected = isConnected || solanaConnected;
  const displayAddress = address || publicKey?.toString();

  return (
    <div className="vestige-wallet-container">
      {!isWalletConnected ? (
        <button className="vestige-wallet-button" onClick={() => setIsOpen(!isOpen)}>
          <span>🔌 Conectar Wallet</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
        </button>
      ) : (
        <div className="vestige-wallet-connected">
          <span className="vestige-wallet-address">{displayAddress?.slice(0, 6)}...{displayAddress?.slice(-4)}</span>
          <button className="vestige-wallet-disconnect" onClick={handleDisconnect}>✕</button>
        </div>
      )}
      {isOpen && !isWalletConnected && (
        <div className="vestige-wallet-dropdown">
          {WALLETS.map((wallet) => (
            <button key={wallet.name} className="vestige-wallet-item" onClick={() => handleConnect(wallet)}>
              <img src={wallet.logo} alt={wallet.name} className="vestige-wallet-logo" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
              <span>{wallet.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}