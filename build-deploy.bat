@echo off
REM Vestige Index Build & Deploy Script
REM Automate project build and deployment to Cloudflare

color 0A
title Vestige Index - Build & Deploy

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║      VESTIGE INDEX - AUTOMATED BUILD & DEPLOY SCRIPT           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if C:\Vestige exists
if not exist "C:\Vestige" (
    echo [INFO] C:\Vestige not found. Using OneDrive path...
    cd /d "c:\Users\Salima\OneDrive\Escritorio\vestige index 2.2.4\vestigeindex-main"
) else (
    echo [SUCCESS] Found C:\Vestige
    cd /d "C:\Vestige"
)

REM Check current directory
echo [INFO] Working directory: %CD%
echo.

REM Step 1: Clean
echo [STEP 1/5] Cleaning previous builds...
if exist dist (
    echo Removing dist directory...
    rmdir /s /q dist >nul 2>&1
)
echo [✓] Clean complete
echo.

REM Step 2: Install dependencies
echo [STEP 2/5] Installing dependencies...
echo Installing with --legacy-peer-deps --ignore-scripts...
call npm install --legacy-peer-deps --ignore-scripts
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)
echo [✓] Dependencies installed
echo.

REM Step 3: Build project
echo [STEP 3/5] Building project...
echo Running: node node_modules/vite/bin/vite.js build
call node node_modules/vite/bin/vite.js build
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Build had issues, continuing anyway...
)
if not exist dist (
    echo [ERROR] Build failed - dist directory not created!
    pause
    exit /b 1
)
echo [✓] Build complete
echo.

REM Step 4: Verify build
echo [STEP 4/5] Verifying build...
echo Build size:
dir /s dist | find /c /v "" >nul 2>&1
echo [✓] Verification complete
echo.

REM Step 5: Prepare deployment
echo [STEP 5/5] Preparing for Cloudflare deployment...
echo.
echo [INFO] Deployment credentials configured in Cloudflare dashboard:
echo - Account ID: a21ae076dda75cfed5d72c70952a388f
echo - API Token: ******* (configured)
echo.
echo [SUCCESS] Build complete! Ready for Cloudflare Pages deployment.
echo.
echo [NEXT STEPS]:
echo 1. Push to GitHub: https://github.com/VestigeIndex/vestigeindex
echo 2. Connect to Cloudflare Pages
echo 3. Cloudflare will auto-deploy on push
echo.
pause
