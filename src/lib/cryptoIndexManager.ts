// Crypto Index Manager - Filter tokens available in free swap APIs

export interface CryptoIndex {
  symbol: string;
  name: string;
  address: string;
  chainId: number;
  decimals: number;
  logo?: string;
  coingeckoId: string;
  availableProviders: string[]; // oneinch, openocean, matcha, odos
  marketCap?: string;
  volume24h?: string;
  change24h?: number;
  trending?: boolean;
}

// Only include tokens that are available in at least 2 free swap APIs
export const AVAILABLE_CRYPTO_INDICES: CryptoIndex[] = [
  // Top tier - Available everywhere
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    address: '0x2260fac5e5542a773aa44fbcff9d5da6c33fdb46', // WBTC on Ethereum
    chainId: 1,
    decimals: 8,
    logo: '/logos/crypto/btc-pro.svg',
    coingeckoId: 'bitcoin',
    availableProviders: ['oneinch', 'openocean', 'matcha', 'odos'],
    trending: true,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    chainId: 1,
    decimals: 18,
    logo: '/logos/crypto/eth-pro.svg',
    coingeckoId: 'ethereum',
    availableProviders: ['oneinch', 'openocean', 'matcha', 'odos'],
    trending: true,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    chainId: 1,
    decimals: 6,
    logo: '/logos/crypto/usdc-pro.svg',
    coingeckoId: 'usd-coin',
    availableProviders: ['oneinch', 'openocean', 'matcha', 'odos'],
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    chainId: 1,
    decimals: 6,
    logo: '/logos/crypto/usdt-pro.svg',
    coingeckoId: 'tether',
    availableProviders: ['oneinch', 'openocean', 'matcha', 'odos'],
  },

  // Layer 2 & Altcoins - Multi-chain available
  {
    symbol: 'ARB',
    name: 'Arbitrum',
    address: '0x912ce59144191c1204e64559fe8253a0e108ff4e',
    chainId: 42161,
    decimals: 18,
    logo: '/logos/crypto/arb-pro.svg',
    coingeckoId: 'arbitrum',
    availableProviders: ['oneinch', 'openocean', 'odos'],
    trending: true,
  },
  {
    symbol: 'OP',
    name: 'Optimism',
    address: '0x4200000000000000000000000000000000000042',
    chainId: 10,
    decimals: 18,
    logo: '/logos/crypto/op-pro.svg',
    coingeckoId: 'optimism',
    availableProviders: ['oneinch', 'openocean', 'odos'],
    trending: true,
  },
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB on BSC
    chainId: 56,
    decimals: 18,
    logo: '/logos/crypto/bnb-pro.svg',
    coingeckoId: 'binancecoin',
    availableProviders: ['oneinch', 'openocean', 'odos'],
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // MATIC on Ethereum
    chainId: 1,
    decimals: 18,
    logo: '/logos/crypto/matic-pro.svg',
    coingeckoId: 'matic-network',
    availableProviders: ['oneinch', 'openocean', 'odos'],
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    address: '0xd31a59c85ae9d8edefec411d448f90841571b89c', // Wrapped SOL
    chainId: 1,
    decimals: 9,
    logo: '/logos/crypto/sol-pro.svg',
    coingeckoId: 'solana',
    availableProviders: ['oneinch', 'openocean'],
  },

  // DeFi tokens - Available in DEX aggregators
  {
    symbol: 'AAVE',
    name: 'Aave',
    address: '0x7fc66500c84a76ad7e9c93437e434122a1f9adf9',
    chainId: 1,
    decimals: 18,
    logo: '/logos/crypto/aave.svg',
    coingeckoId: 'aave',
    availableProviders: ['oneinch', 'openocean', 'odos'],
  },
  {
    symbol: 'UNI',
    name: 'Uniswap',
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    chainId: 1,
    decimals: 18,
    logo: '/logos/crypto/uni.svg',
    coingeckoId: 'uniswap',
    availableProviders: ['oneinch', 'openocean', 'odos'],
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    chainId: 1,
    decimals: 18,
    logo: '/logos/crypto/link.svg',
    coingeckoId: 'chainlink',
    availableProviders: ['oneinch', 'openocean', 'matcha', 'odos'],
  },
  {
    symbol: 'DAI',
    name: 'Dai',
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    chainId: 1,
    decimals: 18,
    logo: '/logos/crypto/dai.svg',
    coingeckoId: 'dai',
    availableProviders: ['oneinch', 'openocean', 'odos'],
  },
];

// Filter indices by available swap providers for a specific chain
export function getIndicesForChain(chainId: number): CryptoIndex[] {
  return AVAILABLE_CRYPTO_INDICES.filter(
    (index) => index.chainId === chainId && index.availableProviders.length >= 2
  );
}

// Filter indices by provider
export function getIndicesForProvider(providerId: string): CryptoIndex[] {
  return AVAILABLE_CRYPTO_INDICES.filter((index) =>
    index.availableProviders.includes(providerId)
  );
}

// Get trending tokens
export function getTrendingIndices(): CryptoIndex[] {
  return AVAILABLE_CRYPTO_INDICES.filter((index) => index.trending).slice(0, 6);
}

// Get token by symbol
export function getIndexBySymbol(symbol: string): CryptoIndex | undefined {
  return AVAILABLE_CRYPTO_INDICES.find((index) => index.symbol === symbol);
}

// Get token by address and chain
export function getIndexByAddress(address: string, chainId: number): CryptoIndex | undefined {
  return AVAILABLE_CRYPTO_INDICES.find(
    (index) => index.address.toLowerCase() === address.toLowerCase() && index.chainId === chainId
  );
}

// Check if token can be swapped on a specific chain
export function canSwapOnChain(symbol: string, chainId: number, provider?: string): boolean {
  const index = getIndexBySymbol(symbol);
  if (!index) return false;
  if (index.chainId !== chainId) return false;
  if (provider && !index.availableProviders.includes(provider)) return false;
  return index.availableProviders.length >= 2;
}

// Get recommended pairs for liquidity
export function getRecommendedPairs(chainId: number): [CryptoIndex, CryptoIndex][] {
  const indices = getIndicesForChain(chainId);
  const pairs: [CryptoIndex, CryptoIndex][] = [];

  // Common liquidity pairs
  const stables = indices.filter((i) => ['USDC', 'USDT', 'DAI'].includes(i.symbol));
  const majors = indices.filter((i) => ['ETH', 'BTC', 'BNB', 'MATIC'].includes(i.symbol));
  const defi = indices.filter((i) => ['AAVE', 'UNI', 'LINK'].includes(i.symbol));

  // Create pairs
  if (stables.length > 0 && majors.length > 0) {
    pairs.push([stables[0], majors[0]]);
  }
  if (majors.length > 1) {
    pairs.push([majors[0], majors[1]]);
  }
  if (defi.length > 0 && stables.length > 0) {
    pairs.push([defi[0], stables[0]]);
  }

  return pairs;
}

// Get market data
export interface MarketData {
  symbol: string;
  price: number;
  marketCap: string;
  volume24h: string;
  change24h: number;
  high24h: number;
  low24h: number;
  ath: number;
  athChange: number;
}

// Mock market data function - replace with real API calls to CoinGecko
export async function getMarketData(coingeckoId: string): Promise<MarketData | null> {
  try {
    // Using CoinGecko free API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_ath=true`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const coinData = data[coingeckoId];

    if (!coinData) return null;

    return {
      symbol: coingeckoId,
      price: coinData.usd || 0,
      marketCap: coinData.usd_market_cap?.toLocaleString() || 'N/A',
      volume24h: coinData.usd_24h_vol?.toLocaleString() || 'N/A',
      change24h: coinData.usd_24h_change || 0,
      high24h: coinData.usd_24h_high || 0,
      low24h: coinData.usd_24h_low || 0,
      ath: coinData.ath?.usd || 0,
      athChange: coinData.ath_change_percentage?.usd || 0,
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}
