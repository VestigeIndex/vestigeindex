import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { getSwapQuote, toDecimals } from '../lib/swapService';

// Props para nueva versión (simple)
interface SimpleSwapModalProps {
  tokenSymbol?: string;
  tokenAddress?: string;
  chainId?: number;
  tokenDecimals?: number;
  fee?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

// Props para versión antigua (Marketplace)
interface OldSwapModalProps {
  coin: {
    name: string;
    symbol: string;
    price: number;
    image?: string;
    solana?: boolean;
  };
  mode: "buy" | "sell";
  feeRate?: number;
  onClose: () => void;
}

type SwapModalProps = SimpleSwapModalProps | OldSwapModalProps;

const EVM_REFERRER = '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F';

export function SwapModal(props: SwapModalProps) {
  const { isConnected, address } = useWallet();
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Verificar si es la nueva versión simple
  const isNewVersion = 'tokenSymbol' in props;
  const onClose = props.onClose;
  const onSuccess = isNewVersion && props.onSuccess ? props.onSuccess : () => {};

  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md text-center">
          <p>⚠️ Conecta tu wallet para intercambiar</p>
          <button onClick={onClose} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Cerrar</button>
        </div>
      </div>
    );
  }

  const handleGetQuote = async () => {
    if (!amount || !address) return;
    setLoading(true);
    try {
      const tokenAddress = isNewVersion ? props.tokenAddress : props.coin?.symbol || '';
      const tokenDecimals = isNewVersion ? (props.tokenDecimals || 18) : 18;
      const chainId = isNewVersion ? (props.chainId || 1) : 1;
      const fee = isNewVersion ? (props.fee || 0.3) : (props as any).feeRate || 0.3;
      
      const amountDecimals = toDecimals(parseFloat(amount), tokenDecimals);
      const quoteData = await getSwapQuote(chainId, tokenAddress, EVM_REFERRER, amountDecimals, address, fee);
      setQuote(quoteData);
    } catch (error) {
      alert('Error obteniendo cotización');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!quote) return;
    const symbol = isNewVersion ? props.tokenSymbol : props.coin?.symbol;
    alert(`Swap de ${amount} ${symbol} ejecutado.`);
    onSuccess();
    onClose();
  };

  const symbol = isNewVersion ? props.tokenSymbol : props.coin?.symbol;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Intercambiar {symbol}</h2>
        <input
          type="number"
          placeholder="Cantidad en USD"
          className="w-full p-2 border rounded mb-4"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          onClick={handleGetQuote}
          disabled={loading || !amount}
          className="w-full bg-blue-600 text-white py-2 rounded mb-2"
        >
          {loading ? 'Obteniendo cotización...' : 'Obtener cotización'}
        </button>
        {quote && (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-4">
            <p>Recibirás: {quote.outAmount} tokens</p>
          </div>
        )}
        <button
          onClick={handleConfirm}
          disabled={!quote}
          className="w-full bg-green-600 text-white py-2 rounded mb-2"
        >
          Confirmar intercambio
        </button>
        <button onClick={onClose} className="w-full bg-gray-500 text-white py-2 rounded">
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default SwapModal;
