#!/bin/bash

# Frontend Deployment Script for dromniaclinic.com
# This script prepares and deploys the frontend to production

set -e

echo "🚀 Starting frontend deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="frontend"
REMOTE_USER="${DEPLOY_USER:-your-user}"
REMOTE_HOST="${DEPLOY_HOST:-dromniaclinic.com}"
REMOTE_PATH="${DEPLOY_PATH:-/var/www/obgyn-clinic/frontend}"

# Check if we're in the right directory
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Error: frontend directory not found${NC}"
    exit 1
fi

cd "$FRONTEND_DIR"

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "Creating .env file with production API URL..."
    echo "REACT_APP_API_URL=https://dromniaclinic.com" > .env
    echo -e "${GREEN}✅ Created .env file${NC}"
fi

# Update API URL in .env
if grep -q "REACT_APP_API_URL" .env; then
    sed -i.bak 's|REACT_APP_API_URL=.*|REACT_APP_API_URL=https://dromniaclinic.com|' .env
    echo -e "${GREEN}✅ Updated API URL to https://dromniaclinic.com${NC}"
else
    echo "REACT_APP_API_URL=https://dromniaclinic.com" >> .env
    echo -e "${GREEN}✅ Added API URL to .env${NC}"
fi

echo ""
echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🔨 Step 2: Building React application..."
npm run build

echo ""
echo "📋 Step 3: Checking build output..."
if [ ! -d "build" ]; then
    echo -e "${RED}❌ Error: build directory not found. Build failed.${NC}"
    exit 1
fi

# Check build size
BUILD_SIZE=$(du -sh build | cut -f1)
echo -e "${GREEN}✅ Build successful! Size: $BUILD_SIZE${NC}"

echo ""
echo "📝 Step 4: Build contents:"
ls -lh build/ | head -10

echo ""
echo "📤 Step 5: Ready to deploy!"
echo ""
echo "To deploy via SCP:"
echo "  scp -r build/* $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
echo ""
echo "Or use rsync (recommended):"
echo "  rsync -avz --delete build/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
echo ""
echo "For Hostinger File Manager:"
echo "  1. Zip the build folder: cd build && zip -r ../frontend-build.zip ."
echo "  2. Upload frontend-build.zip to Hostinger"
echo "  3. Extract to your public_html or www directory"

echo ""
echo -e "${GREEN}✅ Frontend ready for deployment!${NC}"

