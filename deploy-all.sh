#!/bin/bash

# Complete Deployment Script for dromniaclinic.com
# Builds and prepares both backend and frontend for deployment

set -e

echo "🚀 Complete Deployment Preparation for dromniaclinic.com"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Build backend
echo "📦 Building Backend..."
cd backend
npm ci --production
npm run build
cd ..

# Build frontend
echo ""
echo "📦 Building Frontend..."
cd frontend

# Ensure .env exists with correct API URL
if [ ! -f ".env" ]; then
    echo "REACT_APP_API_URL=https://dromniaclinic.com" > .env
fi

# Update API URL
sed -i.bak 's|REACT_APP_API_URL=.*|REACT_APP_API_URL=https://dromniaclinic.com|' .env || \
echo "REACT_APP_API_URL=https://dromniaclinic.com" >> .env

npm install
npm run build
cd ..

echo ""
echo -e "${GREEN}✅ All builds complete!${NC}"
echo ""
echo "📁 Deployment files ready:"
echo "   Backend: backend/dist/"
echo "   Frontend: frontend/build/"
echo ""
echo "📋 Next steps:"
echo "   1. Upload files to your server"
echo "   2. Set up webhook: npm run setup:webhook https://dromniaclinic.com"
echo "   3. Start services"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions"

