import { useState, useRef, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ChevronDown, Wallet } from 'lucide-react';
import { WALLETS, WALLET_LOGOS } from '../config/wallets';

export function WalletConnector() {
  const { connected, publicKey } = useSolanaWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2" ref={dropdownRef}>
      {/* Custom Wallet Dropdown - Single Button */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 transition-all"
        >
          <Wallet size={16} />
          <span>Connect Wallet</span>
          <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-700">
              Select Wallet
            </div>
            <div className="py-1">
              {WALLETS.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => {
                    setDropdownOpen(false);
                    // Trigger RainbowKit modal for EVM wallets
                    if (wallet.type === 'evm') {
                      document.querySelector<HTMLButtonElement>('.rainbowkit-button')?.click();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 transition-colors text-white"
                >
                  <img 
                    src={WALLET_LOGOS[wallet.id as keyof typeof WALLET_LOGOS]} 
                    alt={wallet.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium">{wallet.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}