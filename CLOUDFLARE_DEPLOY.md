# Cloudflare Pages Deployment Guide

## Option 1: Connect GitHub Repository (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com

2. **Create Pages Project**
   - Click **Pages** in the left sidebar
   - Click **Create a project**
   - Select **Connect to Git**
   - Authorize GitHub

3. **Select Repository**
   - Choose `VestigeIndex/vestigeindex`

4. **Configure Build Settings**
   - Production branch: `main`
   - Build command: `npm run build`
   - Output directory: `dist`

5. **Environment Variables**
   Add these in Settings → Environment variables:
   ```
   VITE_WALLETCONNECT_PROJECT_ID = 9b39025ad1e21900725d77ef50a908cd
   VITE_CRYPTOCOMPARE_API_KEY = 82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f
   VITE_EVM_FEE_ADDRESS = 0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F
   VITE_SOL_FEE_ADDRESS = BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt
   ```

6. **Deploy**
   - Click **Save and Deploy**

---

## Option 2: wrangler CLI (Requires Valid API Token)

```bash
# Install wrangler globally
npm install -g wrangler

# Login (opens browser for OAuth)
wrangler login

# Or use API token
export CLOUDFLARE_API_TOKEN=your_full_token
export CLOUDFLARE_ACCOUNT_ID=your_account_id

# Deploy
./scripts/deploy-cloudflare.sh
```

## Option 3: GitHub Actions (Requires Token Fix)

Generate a GitHub token with `workflow` scope, then run:

```bash
git checkout -b deploy-workflow
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions workflow"
git push -u origin deploy-workflow
```

Then create a PR.

---

## Required Tokens

### Cloudflare API Token
Create at: https://dash.cloudflare.com/profile/api-tokens

**Required Permissions:**
- Cloudflare Pages: Edit
- Cloudflare Workers: Edit
- Zone: Read

**Token Format:**
Starts with `v1.0-` and is 40+ characters long

### Cloudflare Account ID
Find at: https://dash.cloudflare.com → Overview → Account ID

---

## Troubleshooting

### Build Fails
```bash
npm run build
# Check for errors
```

### Environment Variables Not Loading
- Ensure variables start with `VITE_` for frontend access
- Rebuild is required after changing env vars

### Token Errors
- Verify token has correct permissions
- Check token hasn't expired
- Ensure account ID is correct