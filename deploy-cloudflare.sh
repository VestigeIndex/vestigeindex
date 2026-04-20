#!/bin/bash
# Cloudflare Pages Deployment Script
# This script deploys the Vestige Index project to Cloudflare Pages

set -e

echo "🚀 Starting Cloudflare Pages Deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --ignore-scripts

# Build project
echo "🔨 Building project..."
npm run build

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Build failed: dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"
echo "📤 Project ready for Cloudflare Pages deployment"
echo ""
echo "🔗 Manual Deployment Steps:"
echo "1. Push to GitHub: https://github.com/VestigeIndex/vestigeindex"
echo "2. Connect to Cloudflare Pages"
echo "3. Set Build Command: npm run build"
echo "4. Set Output Directory: dist"
echo "5. Add Environment Variables in Cloudflare Dashboard"
echo ""
echo "✅ Deployment script completed!"
