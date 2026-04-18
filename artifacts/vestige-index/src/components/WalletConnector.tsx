import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletConnector() {
  const { connected, publicKey } = useSolanaWallet();

  return (
    <div className="flex items-center gap-3">
      {/* EVM Wallets (MetaMask, Trust Wallet, etc.) */}
      <ConnectButton 
        chainStatus="icon"
        showBalance={{ smallScreen: false, largeScreen: true }}
      />
      
      {/* Solana Wallets (Phantom, Trust Solana) - mismo estilo que RainbowKit */}
      <WalletMultiButton 
        className="!bg-gray-900 hover:!bg-gray-800 !text-white !px-4 !py-2 !rounded-xl !font-medium !transition-all !border !border-gray-700"
      >
        {!connected ? (
          <div className="flex items-center gap-2">
            <img src="https://cryptologos.cc/logos/phantom-phantom-logo.svg" alt="Phantom" className="w-5 h-5" />
            <span>Solana</span>
          </div>
        ) : null}
      </WalletMultiButton>
    </div>
  );
}