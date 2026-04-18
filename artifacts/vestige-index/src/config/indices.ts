export interface TokenizedIndex {
  symbol: string;
  name: string;
  address: string;
  chain: "ethereum" | "solana";
  correlation: string;
  description: string;
  category: string;
  commission: number;
  coinGeckoId?: string;
}

export const TOKENIZED_INDICES: TokenizedIndex[] = [
  {
    symbol: "DPI",
    name: "DeFi Pulse Index",
    address: "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b",
    chain: "ethereum",
    correlation: "Cesta DeFi",
    description: "Índice ponderado de los principales tokens DeFi (UNI, AAVE, COMP, MKR, SNX, SUSHI, YFI)",
    category: "DeFi",
    commission: 0.5,
    coinGeckoId: "defipulse-index",
  },
  {
    symbol: "MVI",
    name: "Metaverse Index",
    address: "0x72e364F2ABdC788b7E918bc238B21f109Cd634D7",
    chain: "ethereum",
    correlation: "Metaverso",
    description: "Exposición diversificada al ecosistema metaverso (MANA, ENJ, SAND, AXS, ALTM, GODS)",
    category: "Metaverse",
    commission: 0.5,
    coinGeckoId: "metaverse-index",
  },
  {
    symbol: "IC21",
    name: "Index Coop Large Cap Index",
    address: "0x1B5E16C5b20Fb5EE87C61fE9Afe735Cca3B21A65",
    chain: "ethereum",
    correlation: "Top 21 cripto",
    description: "Índice de las 21 principales criptomonedas por capitalización de mercado",
    category: "Multi-Crypto",
    commission: 0.5,
    coinGeckoId: "index-coop-large-cap-index",
  },
  {
    symbol: "PAXG",
    name: "PAX Gold",
    address: "0x45804880De22913dAFE09f4980848ECE6EcbAf78",
    chain: "ethereum",
    correlation: "Oro físico",
    description: "Token respaldado por oro físico certificado (1 PAXG = 1 onza troy de oro)",
    category: "Commodity",
    commission: 0.5,
    coinGeckoId: "pax-gold",
  },
  {
    symbol: "XAUt",
    name: "Tether Gold",
    address: "0x68749665FF8D2d112Fa859AA293F07A622782F38",
    chain: "ethereum",
    correlation: "Oro físico",
    description: "Token de oro digital de Tether con respaldo físico en Lingotes",
    category: "Commodity",
    commission: 0.5,
    coinGeckoId: "tether-gold",
  },
  {
    symbol: "bCSPX",
    name: "Backed S&P 500",
    address: "0x1e2C4fb7eDE391d116E6B41cD0608260e8801D59",
    chain: "ethereum",
    correlation: "S&P 500",
    description: "Token ERC-20 respaldado por el índice S&P 500 (renta variable USA)",
    category: "Traditional",
    commission: 0.5,
    coinGeckoId: "backed-cspx",
  },
  {
    symbol: "bIBTA",
    name: "Backed Treasury Bond",
    address: "0x52d134c6db5889fad3542a09eaf7aa90c0fdf9e4",
    chain: "ethereum",
    correlation: "Bonos USA",
    description: "Token respaldado por bonos del tesoro USA a corto plazo (0-1 año)",
    category: "Traditional",
    commission: 0.5,
    coinGeckoId: "backed-ibta",
  },
  {
    symbol: "sDEFI",
    name: "Synthetix DeFi Index",
    address: "0xE0E05C43c097B0982Db6c9E6261004e7EA0bA894",
    chain: "ethereum",
    correlation: "DeFi sintético",
    description: "Índice sintético de DeFi de Synthetix (synthetic tokens)",
    category: "DeFi",
    commission: 0.5,
    coinGeckoId: "synthetix-defi-index",
  },
];

export const getIndexBySymbol = (symbol: string): TokenizedIndex | undefined => {
  return TOKENIZED_INDICES.find((idx) => idx.symbol === symbol);
};

export const getIndicesByCategory = (category: string): TokenizedIndex[] => {
  return TOKENIZED_INDICES.filter((idx) => idx.category === category);
};

export const CATEGORIES = [
  "DeFi",
  "Metaverse",
  "Multi-Crypto",
  "Commodity",
  "Traditional",
  "Data",
  "Exchanges",
  "Infrastructure",
] as const;

export type Category = typeof CATEGORIES[number];

export const categoryColors: Record<string, { bg: string; text: string }> = {
  DeFi: { bg: "bg-violet-100", text: "text-violet-700" },
  Metaverse: { bg: "bg-blue-100", text: "text-blue-700" },
  "Multi-Crypto": { bg: "bg-indigo-100", text: "text-indigo-700" },
  Commodity: { bg: "bg-amber-100", text: "text-amber-700" },
  Traditional: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Data: { bg: "bg-cyan-100", text: "text-cyan-700" },
  Exchanges: { bg: "bg-rose-100", text: "text-rose-700" },
  Infrastructure: { bg: "bg-slate-100", text: "text-slate-700" },
};