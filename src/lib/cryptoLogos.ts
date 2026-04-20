// ============================================
// LOGOS PARA ÍNDICES TOKENIZADOS
// ============================================
export const INDEX_LOGOS: Record<string, string> = {
  DPI: 'https://cryptologos.cc/logos/defi-pulse-index-dpi-logo.svg',
  MVI: 'https://cryptologos.cc/logos/metaverse-index-mvi-logo.svg',
  PAXG: 'https://cryptologos.cc/logos/pax-gold-paxg-logo.svg',
  XAUt: 'https://cryptologos.cc/logos/tether-gold-xaut-logo.svg',
  LINK: 'https://cryptologos.cc/logos/chainlink-link-logo.svg',
  '1INCH': 'https://cryptologos.cc/logos/1inch-1inch-logo.svg',
  OIL: 'https://cryptologos.cc/logos/crude-oil-oil-logo.svg',
  KAS: 'https://cryptologos.cc/logos/kaspa-kas-logo.svg',
};

// ============================================
// LOGOS PARA TOP 1000 (usando Cryptologos CDN)
// ============================================

// Mapeo de símbolos comunes a nombres exactos en Cryptologos
const SYMBOL_TO_LOGO_NAME: Record<string, string> = {
  BTC: 'bitcoin-btc',
  ETH: 'ethereum-eth',
  BNB: 'bnb-bnb',
  SOL: 'solana-sol',
  XRP: 'xrp-xrp',
  ADA: 'cardano-ada',
  DOGE: 'dogecoin-doge',
  DOT: 'polkadot-new-dot',
  MATIC: 'polygon-matic',
  LINK: 'chainlink-link',
  LTC: 'litecoin-ltc',
  TRX: 'tron-trx',
  AVAX: 'avalanche-avax',
  SHIB: 'shiba-inu-shib',
  UNI: 'uniswap-uni',
  ATOM: 'cosmos-atom',
  FIL: 'filecoin-fil',
  VET: 'vechain-vet',
  ALGO: 'algorand-algo',
  ETC: 'ethereum-classic-etc',
  ICP: 'internet-computer-icp',
  APT: 'aptos-apt',
  ARB: 'arbitrum-arb',
  OP: 'optimism-op',
  SUI: 'sui-sui',
  INJ: 'injective-inj',
  SEI: 'sei-network-sei',
  TIA: 'celestia-tia',
  NEAR: 'near-protocol-near',
  FTM: 'fantom-ftm',
  HBAR: 'hedera-hbar',
  XMR: 'monero-xmr',
  ZEC: 'zcash-zec',
  DASH: 'dash-dash',
  NEO: 'neo-neo',
  KAVA: 'kava-kava',
  CAKE: 'pancakeswap-cake',
  RUNE: 'thorswap-rune',
  KSM: 'kusama-ksm',
  CRO: 'cronos-cro',
  QNT: 'quant-qnt',
  EGLD: 'multiversx-egld',
  MINA: 'mina-mina',
  IMX: 'immutable-x-imx',
  RNDR: 'render-rndr',
  STX: 'stacks-stx',
  BONK: 'bonk-bonk',
  WIF: 'dogwifcoin-wif',
  JUP: 'jupiter-jup',
  BTT: 'bittorrent-btt',
  TON: 'toncoin-ton',
  XTZ: 'tezos-xtz',
  IOTA: 'iota-miota',
  NEXO: 'nexo-nexo',
  ENS: 'ethereum-name-service-ens',
  LDO: 'lido-dao-ldo',
  GRT: 'the-graph-grt',
  SNX: 'synthetix-snx',
  MKR: 'maker-mkr',
  AAVE: 'aave-aave',
  COMP: 'compound-comp',
  CRV: 'curve-dao-token-crv',
  SUSHI: 'sushiswap-sushi',
  YFI: 'yearn-finance-yfi',
  BAL: 'balancer-bal',
  ZRX: '0x-zrx',
  ENJ: 'enjin-coin-enj',
  MANA: 'decentraland-mana',
  SAND: 'the-sandbox-sand',
  GALA: 'gala-gala',
  AXS: 'axie-infinity-axs',
  ILV: 'illuvium-ilv',
};

// Obtener logo de Cryptologos (más fiable)
export function getCryptoLogoSync(symbol: string): string {
  const normalizedSymbol = symbol.toUpperCase().replace('USDT', '').replace('BUSD', '').replace('USDC', '');
  
  // 1. Verificar si es índice tokenizado
  if (INDEX_LOGOS[normalizedSymbol]) {
    return INDEX_LOGOS[normalizedSymbol];
  }
  
  // 2. Buscar en el mapeo
  const logoName = SYMBOL_TO_LOGO_NAME[normalizedSymbol];
  if (logoName) {
    return `https://cryptologos.cc/logos/${logoName}-logo.svg`;
  }
  
  // 3. Fallback: intentar con el símbolo en minúsculas
  const lowerSymbol = normalizedSymbol.toLowerCase();
  return `https://cryptologos.cc/logos/${lowerSymbol}-${lowerSymbol}-logo.svg`;
}

// Versión asíncrona (por si se necesita)
export async function getCryptoLogo(symbol: string): Promise<string> {
  return getCryptoLogoSync(symbol);
}