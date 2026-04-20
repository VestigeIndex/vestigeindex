#!/usr/bin/env pwsh
# Vestige Index Deploy Script
# Automates build and deployment to Cloudflare Pages

param(
    [switch]$SkipInstall = $false,
    [switch]$SkipBuild = $false,
    [switch]$Deploy = $false
)

$ErrorActionPreference = "Stop"

Write-Host "
╔════════════════════════════════════════════════════════════════╗
║      VESTIGE INDEX - DEPLOYMENT MANAGER                        ║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Detect working directory
if (Test-Path "C:\Vestige\package.json") {
    $workDir = "C:\Vestige"
    Write-Host "[✓] Using C:\Vestige" -ForegroundColor Green
} else {
    $workDir = "c:\Users\Salima\OneDrive\Escritorio\vestige index 2.2.4\vestigeindex-main"
    if (-not (Test-Path "$workDir\package.json")) {
        Write-Host "[✗] Project not found!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[✓] Using OneDrive path" -ForegroundColor Green
}

Set-Location $workDir
Write-Host "[INFO] Working directory: $workDir`n" -ForegroundColor Cyan

# Step 1: Install
if (-not $SkipInstall) {
    Write-Host "[STEP 1/3] Installing dependencies..." -ForegroundColor Yellow
    
    if (Test-Path "node_modules") {
        Write-Host "Cleaning node_modules..." -ForegroundColor Gray
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
    }
    
    & npm install --legacy-peer-deps --ignore-scripts 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[✗] npm install failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[✓] Dependencies installed`n" -ForegroundColor Green
} else {
    Write-Host "[⊘] Skipping install`n" -ForegroundColor Gray
}

# Step 2: Build
if (-not $SkipBuild) {
    Write-Host "[STEP 2/3] Building project..." -ForegroundColor Yellow
    
    if (Test-Path "dist") {
        Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue | Out-Null
    }
    
    & node node_modules/vite/bin/vite.js build --config vite.config.ts 2>&1
    
    if (-not (Test-Path "dist")) {
        Write-Host "[✗] Build failed - dist not created!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[✓] Build complete`n" -ForegroundColor Green
} else {
    Write-Host "[⊘] Skipping build`n" -ForegroundColor Gray
}

# Step 3: Deploy
if ($Deploy) {
    Write-Host "[STEP 3/3] Deploying to Cloudflare..." -ForegroundColor Yellow
    
    $token = $env:CLOUDFLARE_API_TOKEN
    $accountId = $env:CLOUDFLARE_ACCOUNT_ID
    
    if (-not $token -or -not $accountId) {
        Write-Host "[!] WARNING: Cloudflare credentials not in environment variables" -ForegroundColor Yellow
        Write-Host "    Set: `$env:CLOUDFLARE_API_TOKEN and `$env:CLOUDFLARE_ACCOUNT_ID`n"
    }
    
    Write-Host "[ℹ] Deploy manually or use GitHub Actions workflow" -ForegroundColor Cyan
    Write-Host "    GitHub Actions will auto-deploy on push to main branch`n"
}

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  BUILD SUCCESSFUL - Ready for Deployment!                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify dist/ contains built files"
Write-Host "2. Push to: https://github.com/VestigeIndex/vestigeindex"
Write-Host "3. Cloudflare Pages will auto-deploy`n"
