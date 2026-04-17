export const EVM_FEE_ADDRESS = "0xa1131edb7a6d5e816bf8548078a88a6bf3d91c7f";
export const SOL_FEE_ADDRESS = "BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt";
export const TRON_FEE_ADDRESS = "TG8H2M4CWNSWmAs2bU5ScC6acx8BSvi7PH";
export const BTC_FEE_ADDRESS = "bc1qlv9cvcfm4m09uzw725e82xuudv6q3zpxqw9x7n";

export const CRYPTOCOMPARE_API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY || "";
export const ONEINCH_API_KEY = import.meta.env.VITE_ONEINCH_API_KEY || "";
export const COINMARKETCAP_API_KEY = import.meta.env.VITE_COINMARKETCAP_API_KEY || "";

// Top 1000 fee (0.3%)
export const TOP1000_FEE = 0.003;
// Indices fee (0.5%)
export const INDEX_FEE = 0.005;
// Backward compatibility - deprecated, use TOP1000_FEE
export const TOP100_FEE = TOP1000_FEE;
export const COMMENT_FEE_USDT = 0.25;

export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

export const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || "";
export const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || "";

export const APP_VERSION = "1.0.0";
