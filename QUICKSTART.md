# 🚀 Quick Start Guide - VESTIGE INDEX

Get up and running with VESTIGE INDEX in less than 5 minutes!

## Installation (2 minutes)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd vestige-index
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` and ensure these values are set:
```env
VITE_WALLETCONNECT_PROJECT_ID=9b39025ad1e21900725d77ef50a908cd
VITE_CRYPTOCOMPARE_API_KEY=82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f
```

### Step 4: Start Development Server
```bash
npm run dev
```

Visit: **http://localhost:5173**

✅ You're live!

---

## First Time Users

### 1. Connect Your Wallet
- Click **"Connect Wallet"** button in top-right
- Select your wallet (MetaMask, Trust Wallet, or Phantom)
- Approve the connection

### 2. Browse Cryptocurrencies
- Navigate to **Marketplace**
- See top 100 coins by volume
- Filter by: Gainers, Losers, or search by name

### 3. View Professional Charts
- Click the **chart icon** on any coin
- Interact with 3D WebGL chart:
  - **Scroll to zoom** in/out
  - **Click & drag to rotate** 3D view
  - **Hover** for detailed OHLCV data
  - Select **time ranges**: 1D, 1W, 1M, 3M, 1Y, ALL

### 4. Execute Swaps
- Click **"Buy"** or **"Sell"** on any coin
- Enter amount in USD
- Review fees (0.3% default)
- Click **Confirm**
- Sign transaction in your wallet

### 5. Read Market News
- Navigate to **News**
- Browse latest crypto news
- Filter by category
- Click to read full articles

---

## Development Commands

### Development
```bash
# Start dev server with hot reload
npm run dev

# Run type checking
npm run typecheck
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Deployment
```bash
# Deploy to Cloudflare Pages (requires wrangler)
wrangler deploy

# Deploy to Vercel (requires vercel CLI)
vercel --prod

# Deploy to Netlify (requires netlify CLI)
netlify deploy --prod
```

---

## Project Structure

### Key Directories

**Components** (`src/components/`)
- `ProChartGL.tsx` - 3D chart with WebGL
- `WalletConnector.tsx` - Wallet connection UI
- `SwapModal.tsx` - Token swap interface
- `Header.tsx`, `Sidebar.tsx` - Navigation

**Pages** (`src/pages/`)
- `Marketplace.tsx` - Top 100 cryptos + charts
- `News.tsx` - Market news
- `Indices.tsx` - Custom indices
- `Admin.tsx` - Admin panel

**Libraries** (`src/lib/`)
- `swapService.ts` - Swap logic (OpenOcean)
- `newsService.ts` - News fetching (CryptoCompare)
- `marketData.ts` - Market data from multiple sources
- `binanceApi.ts` - Binance API integration

**Config** (`src/config/`)
- `wagmi.ts` - Wagmi configuration
- `solana.ts` - Solana wallet setup

---

## Common Tasks

### Add New Cryptocurrency Chain

Edit `src/config/wagmi.ts`:
```typescript
import { newChain } from 'wagmi/chains';

export const chains = [
  mainnet, 
  bsc, 
  polygon, 
  newChain  // Add your chain
];
```

### Modify Swap Fees

Edit `src/lib/constants.ts`:
```typescript
export const TOP100_FEE = 0.005;  // Change from 0.3% to 0.5%
```

### Add New News Category

Edit `src/lib/newsService.ts`:
```typescript
export async function getNewsByCategory(category: string) {
  // Add custom category filtering
}
```

### Customize Chart Colors

Edit `src/components/ProChartGL.tsx`:
```typescript
const color = isGreen ? 0x10b981 : 0xef4444;  // Change colors here
```

---

## Styling

### Tailwind CSS

All styling uses Tailwind CSS. Modify `tailwind.config.ts` to customize:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#1f2937',
      }
    }
  }
}
```

### Dark Mode

Already configured for dark mode. Toggle with:
```typescript
import { useTheme } from 'next-themes';
const { theme, setTheme } = useTheme();
setTheme('dark'); // or 'light'
```

---

## Data Sources

### Public APIs (No Auth Required)

1. **Binance** - Market data
   - Base: `https://api.binance.com/api/v3`
   - No rate limiting for most endpoints

2. **OpenOcean V4** - Token swaps
   - Base: `https://open-api.openocean.finance/v4`
   - Supports 50+ blockchains

3. **CryptoCompare** - News & data
   - Base: `https://min-api.cryptocompare.com`
   - API key: `82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f`

---

## Wallet Integration

### Supported Wallets

**EVM Chains:**
- MetaMask
- Trust Wallet
- Coinbase Wallet
- Any WalletConnect compatible wallet

**Solana:**
- Phantom
- Solflare
- Backpack

### Check Wallet Connection Status

```typescript
import { useAccount } from 'wagmi';

function MyComponent() {
  const { address, isConnected } = useAccount();
  
  if (!isConnected) {
    return <div>Connect your wallet</div>;
  }
  
  return <div>Connected: {address}</div>;
}
```

---

## Testing

### Manual Testing Checklist

- [ ] Wallet connects successfully
- [ ] All chains load correctly
- [ ] Chart renders and is interactive
- [ ] Swap quotes load
- [ ] News feeds update
- [ ] Mobile responsive
- [ ] No console errors

### Browser Testing

```bash
# Test on multiple browsers
# Chrome, Firefox, Safari, Edge

# Test on mobile
# iOS Safari, Chrome Mobile, Firefox Mobile
```

---

## Performance Tips

1. **Cache Clearing**
   ```bash
   rm -rf node_modules/.vite
   npm run build --force
   ```

2. **Bundle Size Check**
   ```bash
   npm run build -- --analyze
   ```

3. **Development Performance**
   - Use React DevTools Profiler
   - Check unnecessary re-renders
   - Use `React.memo()` for heavy components

---

## Debugging

### Enable Debug Logs

```typescript
// Add to main.tsx
localStorage.setItem('DEBUG', 'vestige:*');
```

### Check Swap Status

Open browser DevTools → Network tab:
- Filter: `openocean.finance`
- Check request/response

### Monitor Wallet Events

```typescript
import { useContractEvent } from 'wagmi';

useContractEvent({
  address: tokenAddress,
  abi: ERC20_ABI,
  eventName: 'Transfer',
  listener: (logs) => console.log('Transfer:', logs),
});
```

---

## FAQ

### Q: My wallet won't connect
**A:** 
- Ensure you're on HTTPS (not HTTP)
- Check WalletConnect Project ID in `.env.local`
- Try different browser
- Clear browser cache

### Q: Chart not loading
**A:**
- Check browser console for errors
- Verify WebGL support: `chrome://gpu`
- Try in different browser
- Check Binance API status

### Q: Swap amount is too high/low
**A:**
- Check token decimals
- Verify slippage settings
- Check wallet balance
- Try smaller amount

### Q: How to add custom token?
**A:** Tokens are fetched from Binance. Add support in `getCoinName()` function.

---

## Need Help?

- **Docs**: See [README.md](./README.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: Check [GitHub Issues](https://github.com/your-repo/issues)
- **Community**: Join our [Discord](https://discord.gg/vestige)

---

## Next Steps

1. ✅ Installed and running locally
2. 📚 Read [README.md](./README.md) for full features
3. 🚀 See [DEPLOYMENT.md](./DEPLOYMENT.md) for production
4. 💻 Customize in `src/` directory
5. 🎉 Deploy to Cloudflare/Vercel/Netlify

---

**Happy coding! 🚀**
