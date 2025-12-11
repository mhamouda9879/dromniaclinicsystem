#!/bin/bash

# Create ZIP files for easy deployment via File Manager
# This creates ready-to-upload zip files

set -e

echo "📦 Creating deployment ZIP files..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Build if not already built
if [ ! -d "backend/dist" ]; then
    echo "🔨 Building backend..."
    cd backend
    npm install --production
    npm run build
    cd ..
fi

if [ ! -d "frontend/build" ]; then
    echo "🔨 Building frontend..."
    cd frontend
    if [ ! -f ".env" ]; then
        echo "REACT_APP_API_URL=https://dromniaclinic.com" > .env
    fi
    npm install
    npm run build
    cd ..
fi

echo ""
echo "📦 Creating ZIP files..."

# Backend ZIP
echo "Creating backend-deploy.zip..."
cd backend
zip -r ../backend-deploy.zip dist/ package.json package-lock.json -x "*.map" "*.d.ts"
cd ..
echo -e "${GREEN}✅ Created backend-deploy.zip${NC}"

# Frontend ZIP
echo "Creating frontend-deploy.zip..."
cd frontend/build
zip -r ../../frontend-deploy.zip .
cd ../..
echo -e "${GREEN}✅ Created frontend-deploy.zip${NC}"

echo ""
echo "📋 Files created:"
echo "   📦 backend-deploy.zip  ($(du -h backend-deploy.zip | cut -f1))"
echo "   📦 frontend-deploy.zip ($(du -h frontend-deploy.zip | cut -f1))"
echo ""
echo "📝 Next steps:"
echo "   1. Upload backend-deploy.zip to your server"
echo "   2. Extract to backend folder"
echo "   3. Create .env file with production values"
echo "   4. Upload frontend-deploy.zip"
echo "   5. Extract to public_html or www folder"
echo ""
echo -e "${YELLOW}⚠️  Remember to create .env file separately!${NC}"
echo "   Copy backend/.env.example and update with production values"

