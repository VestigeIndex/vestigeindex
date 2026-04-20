# 📡 API Documentation - VESTIGE INDEX

Complete reference for all data sources and API integrations used in VESTIGE INDEX.

## Table of Contents
1. [Binance API](#binance-api)
2. [OpenOcean V4 Swap](#openocean-v4-swap)
3. [CryptoCompare News](#cryptocompare-news)
4. [Internal Services](#internal-services)

---

## Binance API

Public API for cryptocurrency market data. No authentication required.

### Base URL
```
https://api.binance.com/api/v3
```

### Rate Limits
- Standard: 1200 requests per minute per IP
- Historical data: No limit

### 1. Get Current Price

**Endpoint:** `GET /ticker/price`

**Parameters:**
- `symbol` (string): Trading pair symbol (e.g., `BTCUSDT`)

**Example:**
```bash
curl https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT
```

**Response:**
```json
{
  "symbol": "BTCUSDT",
  "price": "45000.50"
}
```

**Usage in Code:**
```typescript
const response = await fetch(
  'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
);
const data = await response.json();
console.log(data.price); // "45000.50"
```

---

### 2. Get Historical Candles (Klines)

**Endpoint:** `GET /klines`

**Parameters:**
- `symbol` (string): Trading pair
- `interval` (string): 1m, 5m, 15m, 30m, 1h, 4h, 1d, etc.
- `limit` (int): Max 1000 (default: 500)
- `startTime` (long, optional): Start time in milliseconds
- `endTime` (long, optional): End time in milliseconds

**Example:**
```bash
curl "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=100"
```

**Response:**
```json
[
  [
    1609459200000,           // Open time (ms)
    "44500.50",              // Open price
    "45000.00",              // High price
    "44300.00",              // Low price
    "44800.00",              // Close price
    "1000.50",               // Base asset volume
    1609462799999,           // Close time
    "45000000.00",           // Quote asset volume
    5000,                    // Number of trades
    "500.25",                // Taker buy base
    "22500000.00",           // Taker buy quote
    "0"                      // Ignore
  ]
]
```

**Field Mapping:**
```typescript
interface CandleData {
  time: number;              // k[0]
  open: number;              // k[1]
  high: number;              // k[2]
  low: number;               // k[3]
  close: number;             // k[4]
  volume: number;            // k[5]
}
```

**Usage in Code:**
```typescript
async function getCandles(symbol: string, limit: number = 500) {
  const url = `https://api.binance.com/api/v3/klines`;
  const params = new URLSearchParams({
    symbol: `${symbol}USDT`,
    interval: '1h',
    limit: limit.toString()
  });
  
  const response = await fetch(`${url}?${params}`);
  const klines = await response.json();
  
  return klines.map(k => ({
    time: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5])
  }));
}
```

---

### 3. Get Top Coins (24hr Ticker)

**Endpoint:** `GET /ticker/24hr`

**Parameters:**
- Optional filters (none required for top coins)

**Example:**
```bash
curl https://api.binance.com/api/v3/ticker/24hr
```

**Response (truncated):**
```json
[
  {
    "symbol": "BTCUSDT",
    "priceChange": "500.00",
    "priceChangePercent": "1.10",
    "weightedAvgPrice": "44750.00",
    "prevClosePrice": "45000.00",
    "lastPrice": "45500.00",
    "lastQty": "0.5",
    "bidPrice": "45490.00",
    "bidQty": "10.0",
    "askPrice": "45510.00",
    "askQty": "10.0",
    "openPrice": "44500.00",
    "highPrice": "46000.00",
    "lowPrice": "44300.00",
    "volume": "50000.5",
    "quoteVolume": "2250000000.00",
    "openTime": 1609459200000,
    "closeTime": 1609545599999,
    "firstId": 1,
    "lastId": 10000,
    "count": 10000
  }
]
```

**Usage in Marketplace:**
```typescript
const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
const tickers = await response.json();

const cryptos = tickers
  .filter(t => t.symbol.endsWith('USDT'))
  .map(t => ({
    symbol: t.symbol.replace('USDT', ''),
    price: parseFloat(t.lastPrice),
    change24h: parseFloat(t.priceChangePercent),
    volume24h: parseFloat(t.quoteVolume)
  }))
  .sort((a, b) => b.volume24h - a.volume24h)
  .slice(0, 100);
```

---

## OpenOcean V4 Swap

DEX aggregator for token swaps across 50+ blockchains.

### Base URL
```
https://open-api.openocean.finance/v4
```

### 1. Get Swap Quote

**Endpoint:** `POST /{chainId}/swap`

**Parameters:**
```typescript
interface SwapRequest {
  inTokenAddress: string;      // Input token contract address
  outTokenAddress: string;     // Output token contract address
  amountDecimals: string;      // Amount in decimal format
  gasPriceDecimals: string;    // Gas price
  slippage: number;            // Slippage tolerance (1 = 1%)
  account: string;             // User wallet address
  referrer?: string;           // Referrer address for fees
  referrerFee?: number;        // Referrer fee in basis points
}
```

**Example:**
```bash
curl -X POST "https://open-api.openocean.finance/v4/1/swap" \
  -H "Content-Type: application/json" \
  -d '{
    "inTokenAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "outTokenAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "amountDecimals": "1000000000000000000",
    "gasPriceDecimals": "1000000000",
    "slippage": 1,
    "account": "0x123456...",
    "referrer": "0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F",
    "referrerFee": 30
  }'
```

**Response:**
```json
{
  "code": 200,
  "data": {
    "to": "0x6352a56caadc4f1e25cd6c75970fa768a3c67910",
    "data": "0x...",
    "value": "1000000000000000000",
    "gasPrice": "50000000000",
    "gas": "200000"
  }
}
```

**Usage in Code:**
```typescript
async function getSwapQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string
) {
  const url = `https://open-api.openocean.finance/v4/${chainId}/swap`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inTokenAddress: fromToken,
      outTokenAddress: toToken,
      amountDecimals: amount,
      gasPriceDecimals: '1000000000',
      slippage: 1,
      account: userAddress,
      referrer: '0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F',
      referrerFee: 30
    })
  });
  
  const data = await response.json();
  if (data.code === 200) {
    return data.data;
  }
  throw new Error('Swap quote failed');
}
```

### 2. Execute Swap

After getting quote, execute transaction:

```typescript
import { BrowserProvider } from 'ethers';

async function executeSwap(quote: any, signer: any) {
  const tx = await signer.sendTransaction({
    to: quote.to,
    data: quote.data,
    value: quote.value,
    gasLimit: quote.gas
  });
  
  return tx.wait(); // Wait for confirmation
}
```

---

## CryptoCompare News

News aggregator for cryptocurrency market data.

### Base URL
```
https://min-api.cryptocompare.com/data
```

### API Key
```
82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f
```

### 1. Get Latest News

**Endpoint:** `GET /news?lang=EN&sortOrder=latest&api_key=KEY`

**Example:**
```bash
curl "https://min-api.cryptocompare.com/data/news?lang=EN&sortOrder=latest&limit=50&api_key=82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f"
```

**Response:**
```json
{
  "Data": [
    {
      "id": "123456",
      "title": "Bitcoin reaches new ATH",
      "body": "Article description...",
      "url": "https://news.example.com/article",
      "source": "NewsSource",
      "source_info": {
        "name": "CryptoDaily"
      },
      "imageurl": "https://example.com/image.jpg",
      "categories": "BTC|Mining|Regulation",
      "published_on": 1234567890
    }
  ]
}
```

**Usage in Code:**
```typescript
async function getLatestNews() {
  const API_KEY = '82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f';
  const url = `https://min-api.cryptocompare.com/data/news?lang=EN&sortOrder=latest&limit=50&api_key=${API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.Data.map(article => ({
    id: article.id,
    title: article.title,
    description: article.body.substring(0, 200),
    url: article.url,
    imageUrl: article.imageurl,
    source: article.source_info?.name || 'CryptoCompare',
    timestamp: article.published_on * 1000,
    tags: article.categories?.split('|') || []
  }));
}
```

### 2. Get News by Symbol

**Example:**
```typescript
async function getNewsForSymbol(symbol: string) {
  const API_KEY = '82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f';
  const url = `https://min-api.cryptocompare.com/data/news?lang=EN&api_key=${API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.Data.filter(article => {
    const categories = article.categories?.toUpperCase() || '';
    return categories.includes(symbol.toUpperCase());
  });
}
```

---

## Internal Services

### Market Data Service

**File:** `src/lib/marketData.ts`

```typescript
// Fetch market data with fallback system
async function getMarketData(): Promise<TokenData[]>

// Get single token price
async function getTokenPrice(symbol: string): Promise<number>

// Get top N coins
async function getTopCoins(limit: number): Promise<TokenData[]>
```

### News Service

**File:** `src/lib/newsService.ts`

```typescript
// Get latest news
async function getLatestNews(): Promise<NewsArticle[]>

// Get news for specific crypto
async function getNewsForCrypto(symbol: string): Promise<NewsArticle[]>
```

### Swap Service

**File:** `src/lib/swapService.ts`

```typescript
// Get swap quote
export async function getSwapQuote(
  chainId: number,
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string,
  fee: number = 0.3
): Promise<{ success: boolean; data?: any; error?: string }>

// Execute EVM swap
export async function executeEVMSwap(quote: any, signer: any): Promise<string>
```

---

## Error Handling

### Common Errors

**API Timeout:**
```typescript
try {
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('API request timeout');
  }
}
```

**Invalid Token Address:**
```
Error: "Invalid token address" (from OpenOcean)
Solution: Verify token address for target chain
```

**Insufficient Liquidity:**
```
Error: "No routes available" (from OpenOcean)
Solution: Reduce swap amount or try different token pair
```

---

## Caching Strategy

### Local Cache

**For Market Data:**
- Duration: 30 seconds
- Storage: Memory (useState)
- Fallback: localStorage (5 minutes)

**For Chart Data:**
- Duration: 30 minutes
- Storage: localStorage
- Key: `vestige_chart_cache_{symbol}`

**For News:**
- Duration: 15 minutes
- Storage: localStorage
- Key: `vestige_news_cache`

### Implementation
```typescript
function useCache(key: string, duration: number) {
  const [data, setData] = useState(null);
  
  const getFromCache = () => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > duration) return null;
    
    return data;
  };
  
  const setCache = (value: any) => {
    localStorage.setItem(key, JSON.stringify({
      data: value,
      timestamp: Date.now()
    }));
    setData(value);
  };
  
  return { data, setCache, getFromCache };
}
```

---

## Rate Limiting

| API | Limit | Approach |
|-----|-------|----------|
| Binance | 1200/min | Use caching |
| OpenOcean | Unlimited | Direct calls |
| CryptoCompare | Unlimited | Direct calls |

---

## Security Notes

1. **Never expose API keys** in frontend code
   - Use environment variables (VITE_ prefix)
   - Keep sensitive keys in backend only

2. **CORS handling**
   - All public APIs allow CORS
   - No special headers needed

3. **Data validation**
   - Always validate API responses
   - Check for null/undefined values
   - Parse numbers carefully

---

## Testing APIs

### Using curl

```bash
# Get Bitcoin price
curl "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"

# Get latest news
curl "https://min-api.cryptocompare.com/data/news?lang=EN&limit=5"
```

### Using Postman

1. Import collection: [OpenOcean Postman](https://documenter.getpostman.com/view/12948666/TzsfmQvw)
2. Set environment variables
3. Execute requests

### Monitoring

```javascript
// Add to main.tsx for debugging
window.API_DEBUG = true;

// Monitor fetch calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  if (window.API_DEBUG) {
    console.log('API Call:', args[0]);
  }
  return originalFetch(...args);
};
```

---

## References

- [Binance API Docs](https://binance-docs.github.io/apidocs/)
- [OpenOcean Docs](https://openocean.finance/developers)
- [CryptoCompare Docs](https://min-api.cryptocompare.com/)

---

**Last Updated:** 2026-04-19
**API Compatibility:** Tested 2026-04-19
