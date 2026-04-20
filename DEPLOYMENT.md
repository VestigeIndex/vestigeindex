# 🚀 Deployment Guide - VESTIGE INDEX

Complete step-by-step guide to deploy the VESTIGE INDEX platform to production.

## Table of Contents
1. [Cloudflare Pages (Recommended)](#cloudflare-pages-recommended)
2. [Vercel](#vercel)
3. [Netlify](#netlify)
4. [Docker & VPS](#docker--vps)
5. [Environment Configuration](#environment-configuration)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Troubleshooting](#troubleshooting)

---

## Cloudflare Pages (Recommended)

Cloudflare Pages is **free**, **fast**, and provides **edge computing** with excellent performance globally.

### Step 1: Prepare Repository

```bash
# Ensure all code is committed
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Connect to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Pages** in left sidebar
3. Click **Create a project**
4. Select **Connect to Git**
5. Authorize GitHub/GitLab/Bitbucket
6. Select `vestige-index` repository
7. Click **Begin setup**

### Step 3: Configure Build Settings

**Build Configuration:**
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave blank if in root)

**Node.js Version:**
- Set to `18.x` or higher in Environment

### Step 4: Set Environment Variables

In Cloudflare Pages dashboard:

1. Go to **Settings** → **Environment variables**
2. Add production variables:

```
VITE_WALLETCONNECT_PROJECT_ID = 9b39025ad1e21900725d77ef50a908cd
VITE_CRYPTOCOMPARE_API_KEY = 82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f
VITE_EVM_FEE_ADDRESS = 0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F
VITE_SOL_FEE_ADDRESS = BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt
```

### Step 5: Custom Domain (Optional)

1. Go to **Custom domains**
2. Click **Setup a custom domain**
3. Enter your domain (e.g., `vestige.exchange`)
4. Update DNS records in domain provider
5. Verify domain ownership

### Step 6: Deploy

1. Review settings
2. Click **Save and Deploy**
3. Wait for build to complete (typically 2-3 minutes)
4. Access your site at: `https://vestige-index.pages.dev`

### Cloudflare Workers (Advanced)

For backend API routes:

```javascript
// functions/api/[route].js
export async function onRequest(context) {
  const { request } = context;
  
  // Handle API requests
  if (request.method === 'POST') {
    return new Response('Success', { status: 200 });
  }
  
  return new Response('Method not allowed', { status: 405 });
}
```

---

## Vercel

Vercel offers seamless Next.js and React integration with auto-scaling.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
vercel --prod
```

### Step 4: Configure Environment

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_WALLETCONNECT_PROJECT_ID": "@walletconnect_project_id",
    "VITE_CRYPTOCOMPARE_API_KEY": "@cryptocompare_api_key"
  }
}
```

### Step 5: Set Secrets in Dashboard

```bash
vercel env add VITE_WALLETCONNECT_PROJECT_ID
vercel env add VITE_CRYPTOCOMPARE_API_KEY
# ... add all other env vars
```

---

## Netlify

Netlify provides easy git-based deployments with built-in CDN.

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login

```bash
netlify login
```

### Step 3: Initialize Site

```bash
netlify init
```

### Step 4: Configure `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

### Step 5: Deploy

```bash
netlify deploy --prod
```

---

## Docker & VPS

For self-hosted deployment on VPS or with Docker.

### Step 1: Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 3000

ENV PORT=3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Step 2: Build Docker Image

```bash
docker build -t vestige-index:latest .
```

### Step 3: Run Container

```bash
docker run -d \
  -p 3000:3000 \
  -e VITE_WALLETCONNECT_PROJECT_ID=9b39025ad1e21900725d77ef50a908cd \
  -e VITE_CRYPTOCOMPARE_API_KEY=82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f \
  --name vestige-index \
  vestige-index:latest
```

### Step 4: Docker Compose (Multi-service)

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      VITE_WALLETCONNECT_PROJECT_ID: 9b39025ad1e21900725d77ef50a908cd
      VITE_CRYPTOCOMPARE_API_KEY: 82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
```

### Step 5: Deploy to VPS

```bash
# SSH into VPS
ssh root@your_server_ip

# Clone repository
git clone https://github.com/your-repo/vestige-index.git
cd vestige-index

# Create .env file
cat > .env.local << EOF
VITE_WALLETCONNECT_PROJECT_ID=9b39025ad1e21900725d77ef50a908cd
VITE_CRYPTOCOMPARE_API_KEY=82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f
EOF

# Start with Docker Compose
docker-compose up -d
```

---

## Environment Configuration

### Required Environment Variables

```bash
# Wallet Connection
VITE_WALLETCONNECT_PROJECT_ID=9b39025ad1e21900725d77ef50a908cd

# API Keys
VITE_CRYPTOCOMPARE_API_KEY=82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f

# Fee Addresses
VITE_EVM_FEE_ADDRESS=0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F
VITE_SOL_FEE_ADDRESS=BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt

# Optional: For alternative data sources
VITE_ONEINCH_API_KEY=your_api_key
VITE_COINMARKETCAP_API_KEY=your_api_key
```

### Sensitive Data Management

**Never commit `.env` files:**

```bash
# Add to .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use .env.example for reference
cp .env.example .env.local
```

---

## Performance Optimization

### 1. Enable Caching

**Cloudflare Cache Settings:**
```
Browser Cache TTL: 30 minutes
Cache Level: Cache Everything
```

### 2. Minify Assets

Already configured in `vite.config.ts`:
```typescript
build: {
  minify: 'terser',
  sourcemap: false,
}
```

### 3. Enable Compression

Cloudflare automatically compresses with Brotli.

For self-hosted:
```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 1024;
```

### 4. Image Optimization

Images are served from:
- Cloudflare Image Optimization (recommended)
- Local cache with 1-year TTL

### 5. Bundle Analysis

```bash
npm install -g vite-plugin-visualizer
```

Add to `vite.config.ts`:
```typescript
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    visualizer({ open: true })
  ]
});
```

---

## Monitoring & Analytics

### 1. Cloudflare Analytics

- **Real-time analytics** in Cloudflare Dashboard
- **Page views**, **unique visitors**, **bandwidth**
- **Cache hit ratio** monitoring

### 2. Performance Monitoring

Add to `main.tsx`:

```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 3. Error Tracking

Add Sentry:

```bash
npm install @sentry/react
```

Configure:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### 4. Uptime Monitoring

- **Cloudflare Uptime Monitoring** (paid)
- **StatusPage.io** (free tier available)
- **Pingdom** (external monitoring)

---

## Troubleshooting

### Build Fails

```bash
# Clear dependencies and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build

# Check Node version
node --version  # Should be 18+
```

### Environment Variables Not Loading

```bash
# Check if variables are prefixed with VITE_
# Variables must start with VITE_ to be exposed to frontend

# Verify in Cloudflare/Vercel dashboard
# Build logs show: "VITE_WALLETCONNECT_PROJECT_ID=[defined]"
```

### Chart Not Rendering

```javascript
// Check browser console
// Verify WebGL support
console.log(!!document.createElement('canvas').getContext('webgl2'));

// Check Three.js version
console.log(THREE.REVISION);
```

### Wallet Connection Issues

```bash
# Verify WalletConnect Project ID
# Check browser console for WalletConnect errors
# Ensure app is on HTTPS (required for web3)
```

### Slow Performance

```bash
# Check Cloudflare caching status
curl -i https://your-domain.com | grep CF-Cache-Status

# Enable Brotli compression
# Check bundle size
npm run build -- --analyze
```

---

## Rollback Procedure

### Cloudflare Pages

1. Go to **Deployments**
2. Find previous stable deployment
3. Click **Rollback**

### Vercel

```bash
vercel rollback
```

### Git Rollback

```bash
# Find previous commit
git log --oneline

# Rollback to previous commit
git revert <commit-hash>
git push origin main
```

---

## Security Checklist

- [ ] HTTPS enabled everywhere
- [ ] Security headers configured (_headers file)
- [ ] API keys rotated
- [ ] No sensitive data in code
- [ ] Content Security Policy set
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (if using API)
- [ ] Regular security updates

---

## Post-Deployment Checklist

- [ ] Test all wallet connections
- [ ] Verify chart renders correctly
- [ ] Test swap functionality
- [ ] Check news feed loads
- [ ] Mobile responsiveness tested
- [ ] Performance metrics checked
- [ ] Analytics working
- [ ] Error tracking active

---

## Support & Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/

---

**Last Updated**: 2026-04-19
**Version**: 1.0.0
