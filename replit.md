# Vestige Index — Plataforma Institucional de Criptomonedas

## Descripcion

Plataforma DeFi institucional sin KYC ni custodia. Permite comprar y vender top 100 criptomonedas e indices tokenizados, ver noticias del mercado, usar herramientas financieras, participar en la comunidad y leer el manifiesto filosofico.

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24
- **Package manager**: pnpm
- **TypeScript**: 5.9
- **Frontend**: React 18 + Vite + Tailwind CSS v4
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Charts**: SVG Sparklines custom
- **Routing**: Wouter

## Artifacts

- `artifacts/vestige-index` — Aplicacion frontend principal (React + Vite), preview en `/`
- `artifacts/api-server` — Servidor API Express, preview en `/api`

## Funcionalidades

### Ticker de Precios
- BTC, ETH, BNB, SOL, LINK, 1INCH, S&P 500, Nasdaq, DAX
- Actualiza cada 30 segundos via CoinGecko
- Sin duplicados, animacion continua

### Mercado (Top 100)
- Datos reales de CoinGecko API
- Columnas: rank, activo, precio, cambio 24h, cambio 7d, volumen, market cap, sparkline 7d
- Buscador en tiempo real
- Botones Comprar/Vender con modal de swap
- Comision: 0.3% → EVM: `0xa1131edb7a6d5e816bf8548078a88a6bf3d91c7f`

### Indices Tokenizados
- DPI, MVI, DATA, PAXG, XAUt, LINK, 1INCH, OIL
- Precios reales de CoinGecko
- Tarjetas con categoria y descripcion
- Comision: 0.5% → EVM: `0xa1131edb7a6d5e816bf8548078a88a6bf3d91c7f`

### Noticias
- API CryptoCompare (key: hardcodeada en constants.ts)
- Actualiza cada 5 minutos
- Tarjetas con imagen, fuente y extracto expandible

### Herramientas
- Calculadora de interes compuesto
- Conversor de divisas (10 monedas + BTC/ETH)

### Comunidad
- Muro de comentarios con 20 ejemplos iniciales
- Sistema de likes / dislikes (me gusta / no me gusta)
- Publicar cuesta 0.25 USDT → `0xa1131edb7a6d5e816bf8548078a88a6bf3d91c7f`
- Requiere wallet conectada

### Manifiesto
- 7 secciones con filosofia institucional
- Traducciones completas ES/EN/ZH

### Conexion de Wallets
- MetaMask, WalletConnect, Coinbase Wallet (EVM via componente interno)
- Phantom (Solana)
- Muestra direccion abreviada en header

### Panel de Administracion (oculto)
- Acceso: triple clic en version del footer
- Credenciales: VestigeAdmin / AdminGlobal2025
- Tabs: Comisiones acumuladas, Gestionar tokens, Moderar comentarios

### Disenio
- Modo oscuro: fondo #000000, texto #FFFFFF
- Modo claro: fondo #FFFFFF, texto #000000
- Toggle en header
- Sidebar colapsable con iconos

### Multidioma
- ES (Espanol), EN (English), ZH (中文)
- Selector en header
- Toda la interfaz traducida

## Constantes Criticas (src/lib/constants.ts)

- `EVM_FEE_ADDRESS`: `0xa1131edb7a6d5e816bf8548078a88a6bf3d91c7f`
- `SOL_FEE_ADDRESS`: `BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt`
- `TRON_FEE_ADDRESS`: `TG8H2M4CWNSWmAs2bU5ScC6acx8BSvi7PH`
- `BTC_FEE_ADDRESS`: `bc1qlv9cvcfm4m09uzw725e82xuudv6q3zpxqw9x7n`
- `CRYPTOCOMPARE_API_KEY`: hardcodeada
- `ONEINCH_API_KEY`: hardcodeada
- `TOP100_FEE`: 0.003 (0.3%)
- `INDEX_FEE`: 0.005 (0.5%)
- `COMMENT_FEE_USDT`: 0.25

## Key Commands

- `pnpm run typecheck` — typecheck completo
- `pnpm run build` — build todos los paquetes
- `pnpm --filter @workspace/vestige-index run dev` — desarrollo frontend
- `pnpm --filter @workspace/api-server run dev` — desarrollo API
