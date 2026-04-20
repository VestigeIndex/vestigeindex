@echo off
setlocal enabledelayedexpansion

:: Vestige Index - Build Script
:: Navigate to project and build

set PROJECT=c:\Users\Salima\OneDrive\Escritorio\vestige index 2.2.4\vestigeindex-main

echo Building Vestige Index...
echo.

pushd "%PROJECT%"
if %ERRORLEVEL% NEQ 0 (
    echo Error: Could not navigate to project directory
    echo Path: %PROJECT%
    pause
    exit /b 1
)

echo Current directory: %CD%
echo.

:: Build with vite
echo Running build...
node node_modules\vite\bin\vite.js build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Build SUCCESS!
    echo.
    echo Checking output...
    if exist dist (
        echo ✓ dist directory created
        dir /s dist | find /v "" > nul
        echo ✓ Build artifacts ready for deployment
    )
) else (
    echo.
    echo Build FAILED with error code %ERRORLEVEL%
)

echo.
pause
popd
