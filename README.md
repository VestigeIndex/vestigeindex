# 🚀 VESTIGE INDEX - Web3 DeFi Platform

Professional, production-ready DeFi institutional platform with real-time data, 3D WebGL charts, wallet connectivity, and token swaps.

## ✨ Features

### 🎯 Core Features
- ✅ **Multi-Wallet Support**: MetaMask, Trust Wallet, Phantom (Solana)
- ✅ **Top 1000 Cryptocurrencies**: Real-time market data from Binance
- ✅ **Professional 3D Charts**: WebGL-powered candlestick charts with zoom/pan
- ✅ **Buy/Sell Tokens**: Integrated swaps via OpenOcean V4
- ✅ **Market News**: Latest crypto news from CryptoCompare
- ✅ **Real-time Pricing**: Updates every 5 seconds
- ✅ **Price History Caching**: Local storage for optimal performance

### 📊 Advanced Chart Features
- 3D Japanese Candlesticks with WebGL rendering
- Time ranges: 1D, 1W, 1M, 3M, 1Y, ALL
- Interactive tooltips with OHLCV data
- Real-time price tracking
- Responsive design for all screen sizes

### 🔐 Wallet Integration
- **EVM Chains**: Ethereum, BSC, Polygon, Arbitrum, Optimism, Base
- **Solana**: Full SPL token support
- **WalletConnect**: Universal connection protocol
- **RainbowKit**: Beautiful wallet UI

### 💱 Swap Features
- **OpenOcean V4**: Primary DEX aggregator
- **Fee Collection**: 0.3% fee on swaps (configurable)
- **Slippage Protection**: Automatic slippage tolerance
- **Multi-chain**: Support for major EVM chains + Solana

### 📰 Market Intelligence
- Real-time market news
- Trend analysis
- Community sentiment
- Category-based filtering

## 🛠️ Tech Stack

**Frontend:**
- React 18.3 with TypeScript
- Vite 5.4 (build tool)
- Tailwind CSS 3.4
- Three.js for WebGL charts

**Web3:**
- Wagmi 2.x for EVM interactions
- Ethers.js 6.x
- Viem 2.x
- RainbowKit 2.x
- Solana Web3.js
- Wallet Adapter

**UI Components:**
- Radix UI primitives
- Lucide React icons
- Shadcn/ui components

## 🔑 Hardcoded Keys & Addresses

```
WalletConnect Project ID: 9b39025ad1e21900725d77ef50a908cd
EVM Fee Address: 0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F
Solana Fee Address: BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt
CryptoCompare API Key: 82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f
```

## 📡 Data Sources (All Public APIs)

### 1. **Binance API** (Market Data)
- Historical candles: `https://api.binance.com/api/v3/klines`
- Current prices: `https://api.binance.com/api/v3/ticker/price`
- Top 100: `https://api.binance.com/api/v3/ticker/24hr`

### 2. **OpenOcean V4** (Swaps)
- Endpoint: `https://open-api.openocean.finance/v4/{chainId}/swap`
- Parameters: `referrer` and `referrerFee` for commission tracking

### 3. **CryptoCompare** (News)
- Endpoint: `https://min-api.cryptocompare.com/data/news`
- API Key: Pre-configured in environment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vestige-index

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📦 Environment Variables

Create `.env.local` from `.env.example`:

```env
VITE_WALLETCONNECT_PROJECT_ID=9b39025ad1e21900725d77ef50a908cd
VITE_CRYPTOCOMPARE_API_KEY=82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f
VITE_EVM_FEE_ADDRESS=0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F
VITE_SOL_FEE_ADDRESS=BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt
```

## 🌐 Deployment

### Cloudflare Pages (Recommended)

1. **Connect Git Repository**
   - Push code to GitHub/GitLab/Bitbucket
   - Connect repo to Cloudflare Pages

2. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: 18.x or higher

3. **Environment Variables**
   - Add all variables from `.env.example` in Cloudflare dashboard

4. **Custom Domain** (Optional)
   - Configure custom domain in Cloudflare dashboard

5. **Automatic Deployments**
   - Deploy on every commit to main branch

### Deploy Configuration Files

The following files are already configured for Cloudflare Pages:

**`public/_redirects`**
```
/* /index.html 200
```

**`public/_headers`**
```
/assets/*
  Content-Type: text/css
  Cache-Control: public, max-age=31536000, immutable
```

### Alternative Deployments

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📁 Project Structure

```
vestige-index/
├── src/
│   ├── components/          # React components
│   │   ├── ProChartGL.tsx  # 3D WebGL chart
│   │   ├── WalletConnector.tsx
│   │   ├── SwapModal.tsx
│   │   └── ui/             # Shadcn UI components
│   ├── pages/              # Page components
│   │   ├── Marketplace.tsx # Top 100 cryptos
│   │   ├── News.tsx        # Market news
│   │   └── ...
│   ├── lib/                # Utilities & services
│   │   ├── swapService.ts  # Swap logic
│   │   ├── newsService.ts  # News fetching
│   │   ├── marketData.ts   # Market data
│   │   └── constants.ts    # Constants
│   ├── config/             # Configuration
│   │   ├── wagmi.ts        # Wagmi config
│   │   ├── solana.ts       # Solana config
│   │   └── wallets.ts      # Wallet setup
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── App.tsx             # Main app
│   └── main.tsx            # Entry point
├── public/
│   ├── _redirects          # Cloudflare redirects
│   └── _headers            # Cloudflare headers
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

## 🎯 Usage Guide

### For Users

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select your preferred wallet
   - Approve connection

2. **Browse Cryptos**
   - Navigate to Marketplace
   - Search or filter cryptocurrencies
   - View real-time prices and 24h changes

3. **View Charts**
   - Click chart icon on any crypto
   - Interact with 3D chart (zoom, pan, rotate)
   - Select different time ranges
   - View detailed OHLCV data

4. **Swap Tokens**
   - Click "Buy" or "Sell" button
   - Enter amount in USD
   - Review fees and confirm
   - Sign transaction in wallet

5. **Read News**
   - Navigate to News section
   - Browse latest market updates
   - Filter by category
   - Click to read full articles

### For Developers

**Add New Chart Features:**
```tsx
// In ProChartGL.tsx, modify timeRange or add indicators
const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
```

**Customize Swap Fees:**
```tsx
// In constants.ts
export const TOP100_FEE = 0.003; // 0.3%
```

**Add New Chains:**
```tsx
// In wagmi.ts
import { newChain } from 'wagmi/chains';
export const chains = [mainnet, bsc, polygon, arbitrum, newChain];
```

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use `.env.example` as template
   - Rotate API keys regularly

2. **Smart Contract Interactions**
   - Always verify contract addresses
   - Test on testnet first
   - Implement slippage protection

3. **User Data**
   - No user data is stored on servers
   - All transactions are client-side
   - Use HTTPS only

4. **Code Security**
   - Regular dependency updates
   - Security audits recommended
   - Report vulnerabilities responsibly

## 📊 Performance Optimization

1. **Chart Rendering**
   - WebGL hardware acceleration
   - Efficient geometry caching
   - Level-of-detail system

2. **Data Fetching**
   - Local storage caching
   - 30-minute cache duration
   - Request deduplication

3. **Bundle Optimization**
   - Code splitting
   - Tree shaking
   - Minification

## 🐛 Troubleshooting

### Wallet Connection Issues
```bash
# Clear browser cache and reload
# Check WalletConnect Project ID in .env.local
# Ensure wallet is on supported network
```

### Chart Not Loading
```bash
# Check browser console for errors
# Ensure WebGL is enabled
# Try different browser
# Check Binance API status
```

### Swap Fails
```bash
# Verify wallet has enough balance
# Check network connection
# Review slippage settings
# Confirm token addresses
```

## 📝 API Documentation

### Market Data

**Get Historical Prices**
```javascript
const data = await fetch(
  'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=500'
);
```

### News

**Get Latest News**
```javascript
const news = await getLatestNews();
```

### Swap

**Get Quote**
```javascript
const quote = await getSwapQuote(chainId, fromToken, toToken, amount);
```

## 📞 Support

- **Documentation**: [Docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/vestige/vestige-index/issues)
- **Community**: [Discord](https://discord.gg/vestige)

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🎉 Changelog

### v1.0.0 (Current)
- ✅ 3D WebGL chart with Three.js
- ✅ Multi-wallet support (MetaMask, Trust, Phantom)
- ✅ OpenOcean V4 swap integration
- ✅ CryptoCompare news integration
- ✅ Responsive UI with Tailwind CSS
- ✅ Cloudflare Pages deployment
- ✅ Real-time price updates
- ✅ Price history caching

---

**Built with ❤️ by the Vestige Team**

Version: 1.0.0
Last Updated: 2026-04-19
