#!/bin/bash
# Cloudflare Pages Deployment Script
# Usage: CLOUDFLARE_API_TOKEN=your_token CLOUDFLARE_ACCOUNT_ID=your_account_id ./scripts/deploy-cloudflare.sh

set -e

echo "🚀 Deploying to Cloudflare Pages..."

# Check for required variables
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "Error: CLOUDFLARE_API_TOKEN environment variable is required"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "Error: CLOUDFLARE_ACCOUNT_ID environment variable is required"
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy using wrangler
echo "☁️ Deploying to Cloudflare..."
npx wrangler pages project deploy vestige-index \
    --branch=main \
    --commit-message="Deploy $(git rev-parse --short HEAD)" \
    2>&1

echo "✅ Deployment complete!"