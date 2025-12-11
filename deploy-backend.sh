#!/bin/bash

# Backend Deployment Script for dromniaclinic.com
# This script prepares and deploys the backend to production

set -e

echo "🚀 Starting backend deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="backend"
REMOTE_USER="${DEPLOY_USER:-your-user}"
REMOTE_HOST="${DEPLOY_HOST:-your-server.com}"
REMOTE_PATH="${DEPLOY_PATH:-/var/www/obgyn-clinic/backend}"

# Check if we're in the right directory
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Error: backend directory not found${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

echo "📦 Step 1: Installing production dependencies..."
npm ci --production

echo ""
echo "🔨 Step 2: Building application..."
npm run build

echo ""
echo "📋 Step 3: Checking build output..."
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: dist directory not found. Build failed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

echo ""
echo "📝 Step 4: Files to deploy:"
echo "   - dist/"
echo "   - node_modules/"
echo "   - package.json"
echo "   - package-lock.json"
echo "   - .env (make sure this exists with production values)"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found!${NC}"
    echo "   Create .env file with production environment variables"
fi

echo ""
echo "📤 Step 5: Ready to deploy!"
echo ""
echo "To deploy via SCP:"
echo "  scp -r dist/ node_modules/ package.json package-lock.json $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
echo ""
echo "Or use rsync:"
echo "  rsync -avz --exclude 'node_modules' dist/ package.json package-lock.json $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
echo ""
echo "Then on server:"
echo "  1. cd $REMOTE_PATH"
echo "  2. npm install --production"
echo "  3. Copy .env file"
echo "  4. Run migrations: npm run migration:run"
echo "  5. Start with PM2: pm2 start dist/main.js --name obgyn-clinic"

echo ""
echo -e "${GREEN}✅ Backend ready for deployment!${NC}"

