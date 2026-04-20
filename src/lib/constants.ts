export const EVM_FEE_ADDRESS = "0xa1131edb7a6d5e816bf8548078a88a6bf3d91c7f";
export const SOL_FEE_ADDRESS = "BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt";
export const TRON_FEE_ADDRESS = "TG8H2M4CWNSWmAs2bU5ScC6acx8BSvi7PH";
export const BTC_FEE_ADDRESS = "bc1qlv9cvcfm4m09uzw725e82xuudv6q3zpxqw9x7n";

export const CRYPTOCOMPARE_API_KEY =
  import.meta.env.VITE_CRYPTOCOMPARE_API_KEY ||
  "82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f";
export const ONEINCH_API_KEY = import.meta.env.VITE_ONEINCH_API_KEY || "";
export const COINMARKETCAP_API_KEY = import.meta.env.VITE_COINMARKETCAP_API_KEY || "";

export const TOP100_FEE = 0.003;
export const INDEX_FEE = 0.005;
export const COMMENT_FEE_USDT = 0.25;

// WalletConnect - desde variable de entorno (protegido)
export const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

export const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || "";
export const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || "";

export const APP_VERSION = "1.0.0";
