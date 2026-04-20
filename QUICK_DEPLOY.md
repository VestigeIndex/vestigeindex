# ⚡ DEPLOYMENT QUICK START - 20 MINUTES TO LIVE

## 🎯 Objective
Deploy Vestige Index to production via Cloudflare Pages

## ⏱️ Time Required
**~20 minutes** from start to live

---

## 📋 PRE-REQUISITES (5 minutes)

- [ ] GitHub Account (free at github.com)
- [ ] Cloudflare Account (free at cloudflare.com)
- [ ] Git installed on your computer
- [ ] Terminal/Command Prompt access

---

## 🚀 DEPLOYMENT STEPS

### STEP 1: Initialize Git Repository (3 min)

Open Command Prompt or PowerShell:

```powershell
# Navigate to project
cd "c:\Users\Salima\OneDrive\Escritorio\vestige index 2.2.4\vestigeindex-main"

# Initialize git
git init

# Configure your git identity (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - Vestige Index v2.2.4 Production Ready"
```

**✅ Step 1 Complete**

---

### STEP 2: Create GitHub Repository (5 min)

1. Go to https://github.com/new
2. Repository name: `vestigeindex-main`
3. Description: "Vestige Index - DeFi Trading Platform"
4. Choose Public or Private (your preference)
5. Click "Create repository"
6. **Copy the HTTPS URL** (looks like: `https://github.com/YourUsername/vestigeindex-main.git`)

Back in terminal:

```powershell
# Add remote repository (replace URL with your repository URL)
git remote add origin https://github.com/YourUsername/vestigeindex-main.git

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

**✅ Step 2 Complete**

---

### STEP 3: Connect Cloudflare Pages (7 min)

1. **Login to Cloudflare**
   - Go to https://dash.cloudflare.com
   - Login with your account

2. **Create Pages Project**
   - Left sidebar: Click **Pages**
   - Click **Create a project**
   - Select **Connect to Git**

3. **Authorize GitHub**
   - Click **GitHub**
   - Authorize Cloudflare
   - Select repository: **vestigeindex-main**

4. **Configure Build Settings**
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave default/blank)
   - Click **Save and Deploy**

5. **Wait for Build**
   - Cloudflare automatically builds your project
   - Takes 2-5 minutes
   - Watch the build progress

**✅ Step 3 Complete - Your site is now live!**

---

### STEP 4: Add Environment Variables (5 min)

1. **In Cloudflare Dashboard**
   - Go to your Pages project
   - Click **Settings** → **Environment Variables**

2. **Add Production Variables**
   - Click **Add variable**
   - Add each variable:

```
Variable 1:
Name: VITE_WALLETCONNECT_PROJECT_ID
Value: 9b39025ad1e21900725d77ef50a908cd

Variable 2:
Name: VITE_CRYPTOCOMPARE_API_KEY
Value: 82022d21989d2befebdbaa2a4e001369bfc8b20f00dd661ea90b8fbe9102174f

Variable 3:
Name: VITE_EVM_FEE_ADDRESS
Value: 0xA1131edb7A6d5E816BF8548078A88a6bF3D91C7F

Variable 4:
Name: VITE_SOL_FEE_ADDRESS
Value: BpazU34aCvMo1oyhhoxj6u3rnWkXjD8j81rKEFJ2oNLt
```

3. **Set Node.js Version**
   - Go to **Settings** → **Build & Deployment**
   - **Node.js version**: Set to `v18.x`
   - Save changes

4. **Trigger New Deployment**
   - Go to **Deployments** tab
   - Click **Retry build** on latest deployment
   - Wait for rebuild to complete

**✅ Step 4 Complete - Environment variables active!**

---

## ✅ VERIFICATION CHECKLIST

After deployment completes, verify everything works:

- [ ] Site loads at `https://vestigeindex-main.pages.dev`
- [ ] No console errors (F12 → Console)
- [ ] Page displays properly
- [ ] Charts render (if data loads)
- [ ] Wallet connect button visible
- [ ] No 404 errors for assets

---

## 🌍 YOUR PRODUCTION URLs

### Default URL (FREE)
```
https://vestigeindex-main.pages.dev
```
(Replace `vestigeindex-main` with your repository name)

### Custom Domain (Optional)
To use your own domain:
1. In Cloudflare Pages → Custom domains
2. Add your domain
3. Update DNS settings
4. Wait for verification (usually instant)

---

## 🔄 CONTINUOUS DEPLOYMENT

After initial deployment, it's automatic!

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Cloudflare automatically:
# ✓ Detects push to main
# ✓ Triggers build
# ✓ Runs npm run build
# ✓ Deploys to production
# ✓ Live in 2-5 minutes
```

---

## 🐛 TROUBLESHOOTING

### Build Failed
**Check in Cloudflare:**
1. Go to Deployments tab
2. Click failed deployment
3. Scroll to "Build output"
4. Read error message
5. Fix issue in code
6. `git push` again

### Site Shows 404
- Wait 2-3 minutes for deployment
- Hard refresh browser (Ctrl+Shift+R)
- Check if build completed successfully

### Environment Variables Not Working
1. Verify variable names exactly (case-sensitive)
2. Verify values are correct
3. Click "Retry build" after adding variables
4. Wait for new build to complete

### Performance Slow
1. Check Cloudflare analytics (Pages → Analytics)
2. Use https://pagespeed.web.dev for analysis
3. Verify assets loading from CDN

---

## 📊 DEPLOYMENT SUCCESS INDICATORS

You'll know it's working when:

1. **Build Succeeds** ✓
   - Cloudflare shows green checkmark
   - Build log shows "Build successful"

2. **Site Loads** ✓
   - Your site accessible at `vestigeindex-main.pages.dev`
   - No 404 errors

3. **Features Work** ✓
   - UI renders correctly
   - No console errors
   - Data displays

---

## 📞 NEED HELP?

### Documentation Files
- `DEPLOYMENT_GUIDE.md` - Detailed deployment steps
- `PROJECT_STATUS.md` - Project overview
- `ANALYSIS_COMPLETE.md` - What was analyzed
- `README.md` - Project features

### External Resources
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vite Docs](https://vitejs.dev/)
- [GitHub Help](https://docs.github.com/)

---

## 🎉 YOU'RE DONE!

Your **Vestige Index** is now live on production! 

### Next Steps:
- Monitor analytics in Cloudflare
- Share your live URL: `https://vestigeindex-main.pages.dev`
- Continue development with auto-deployments
- Add custom domain when ready

---

**Time to Deploy**: 20 minutes ⏱️  
**Cost**: $0 💰  
**Result**: 🌍 **Live Production Site**

Happy deploying! 🚀

---

*Last Updated: April 19, 2026*
