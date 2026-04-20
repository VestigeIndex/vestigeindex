# VESTIGE INDEX - CLOUDFLARE PAGES DEPLOYMENT GUIDE

## 📋 Project Summary
- **Name**: Vestige Index v2.2.4
- **Type**: DeFi Web3 Trading Platform (React + Vite)
- **Status**: Ready for production deployment
- **Deployment Method**: Cloudflare Pages (Recommended)

---

## 🚀 DEPLOYMENT STEPS

### STEP 1: Prepare GitHub Repository
```bash
# Initialize git if not done
git init

# Add all files
git add .

# Commit
git commit -m "Production deployment - Vestige Index v2.2.4"

# Add GitHub remote (replace with your repo)
git remote add origin https://github.com/YourUsername/vestigeindex-main.git

# Push to main branch
git branch -M main
git push -u origin main
```

**⚠️ IMPORTANT**: Commit the `.env.local` file with the API keys is NOT recommended for production. 
Instead, set environment variables in Cloudflare dashboard (see Step 3).

---

### STEP 2: Connect GitHub to Cloudflare Pages

1. **Go to Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com
   - Login with your Cloudflare account

2. **Navigate to Pages**
   - Click "Pages" in left sidebar
   - Click "Create a project"

3. **Connect Git Repository**
   - Select "Connect to Git"
   - Choose GitHub
   - Authorize Cloudflare access
   - Select repository: `vestigeindex-main`

4. **Configure Build Settings**
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave blank/default)

---

### STEP 3: Set Environment Variables

In Cloudflare Pages Dashboard:

1. Go to Settings → Environment Variables
2. Add Production Variables:

```
Variable Name: VITE_WALLETCONNECT_PROJECT_ID
Value: 9b39025ad1e21900725d77ef50a908cd

Variable Name: VITE_CRYPTOCOMPARE_API_KEY
Value: 82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f

Variable Name: VITE_EVM_FEE_ADDRESS
Value: 0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F

Variable Name: VITE_SOL_FEE_ADDRESS
Value: BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt
```

3. Set Node.js Version:
   - Go to Settings → Build & Deployment → Node.js version
   - Set to: **v18.x** or higher

---

### STEP 4: Deploy

1. Click "Save and Deploy"
2. Wait for build to complete (typically 2-5 minutes)
3. Deployment success notification appears
4. Access your site at: `https://vestigeindex.pages.dev`

---

### STEP 5: Custom Domain (Optional)

1. Go to "Custom domains"
2. Click "Setup a custom domain"
3. Enter your domain (e.g., `vestige.exchange`)
4. Follow DNS configuration instructions
5. Verify domain ownership

---

## 🔄 Continuous Deployment

Once configured, Cloudflare automatically deploys on every push to `main` branch:

```bash
# Make changes locally
git add .
git commit -m "Feature: your changes"
git push origin main

# Cloudflare automatically:
# 1. Detects the push
# 2. Triggers build
# 3. Runs: npm run build
# 4. Deploys dist/ to edge network
# 5. Available worldwide in seconds
```

---

## 📊 Production Features

- ✅ **Global Edge Network**: Auto-distributed worldwide
- ✅ **Free SSL/TLS**: Automatic HTTPS
- ✅ **Auto Scaling**: Handles traffic spikes
- ✅ **Analytics**: Built-in performance monitoring
- ✅ **Rollback**: Easy rollback to previous deployments
- ✅ **Preview Deployments**: Test before production

---

## 🔍 Deployment Verification

### Check Build Logs
1. Go to Deployments tab
2. Click on the latest deployment
3. View build logs for troubleshooting

### Test Production Site
- Visit: `https://vestigeindex.pages.dev`
- Verify:
  - [ ] Page loads without errors
  - [ ] Wallet connection works
  - [ ] Charts load with data
  - [ ] Swaps function properly
  - [ ] News section loads

---

## 🛠 Troubleshooting

### Build Fails
- Check Node.js version compatibility
- Verify all environment variables are set
- Review build logs in Cloudflare dashboard
- Ensure `.env.local` is in `.gitignore`

### Environment Variables Not Loading
- Confirm variables start with `VITE_` prefix
- Trigger a rebuild after adding variables
- Check exact spelling and values

### Performance Issues
- Leverage Cloudflare's Cache Rules
- Enable minification in Vite config
- Consider image optimization

---

## 📝 Project Structure Reference

```
vestigeindex-main/
├── src/                 # Main React source
├── lib/                 # Shared libraries
├── api/                 # Backend routes
├── vite.config.ts       # Vite build config
├── package.json         # Dependencies
└── .env.local          # Environment variables (local only)
```

---

## ✅ Deployment Checklist

- [ ] GitHub repository created and configured
- [ ] Code committed and pushed to main branch
- [ ] Cloudflare Pages project created
- [ ] Build settings configured (npm run build → dist)
- [ ] Environment variables set in CF dashboard
- [ ] Node.js version set to v18+
- [ ] Initial deployment successful
- [ ] Production site verified working
- [ ] Custom domain configured (if needed)
- [ ] Analytics monitoring enabled

---

## 📞 Support Resources

- **Vite Docs**: https://vitejs.dev/
- **Cloudflare Pages**: https://developers.cloudflare.com/pages/
- **React Docs**: https://react.dev/
- **WalletConnect Docs**: https://docs.walletconnect.com/

---

**Deployment Date**: April 19, 2026  
**Version**: Vestige Index v2.2.4  
**Status**: 🟢 Ready for Production
