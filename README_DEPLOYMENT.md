# Quick Deployment Guide for dromniaclinic.com

## 🚀 Quick Start

### Option 1: Automated (Recommended)

Build and prepare everything:

```bash
./deploy-all.sh
```

This will:
- ✅ Build backend for production
- ✅ Build frontend for production  
- ✅ Set correct API URL for frontend
- ✅ Prepare all files

### Option 2: Create ZIP Files (For File Manager Upload)

```bash
./create-deployment-zips.sh
```

This creates:
- `backend-deploy.zip` - Backend files ready to upload
- `frontend-deploy.zip` - Frontend files ready to upload

## 📁 What Gets Deployed

### Backend
- `backend/dist/` - Compiled application
- `backend/package.json` - Dependencies info
- `backend/package-lock.json` - Lock file
- `backend/.env` - Environment variables (create separately!)

### Frontend
- `frontend/build/` - All static files (HTML, CSS, JS)
- Ready to serve via web server

## 📤 Upload to Server

### Via File Manager (Hostinger)

1. **Upload ZIP files** via Hostinger File Manager
2. **Extract** backend-deploy.zip to `backend/` folder
3. **Extract** frontend-deploy.zip to `public_html/` or `www/`
4. **Create** `.env` file in `backend/` folder with production values

### Via SSH/SCP

```bash
# Upload backend
scp -r backend/dist backend/package.json backend/package-lock.json \
  user@dromniaclinic.com:/path/to/backend/

# Upload frontend  
scp -r frontend/build/* user@dromniaclinic.com:/path/to/public_html/
```

## 🔧 Setup on Server

### 1. Backend Setup

```bash
cd backend
npm install --production
# Create .env file with production values
npm run migration:run
npm run seed:users
pm2 start dist/main.js --name obgyn-clinic
```

### 2. Frontend Setup

If using File Manager:
- Just extract files to `public_html/`
- No additional setup needed

### 3. Webhook Setup

```bash
cd backend
npm run setup:webhook https://dromniaclinic.com
```

## ✅ Verify Deployment

```bash
# Check backend health
curl https://dromniaclinic.com/telegram/health

# Check webhook
npm run check:webhook

# Test bot
# Send message to @dromniabot on Telegram
```

## 📚 More Information

- **Detailed Guide:** `docs/HOSTINGER_DEPLOYMENT.md`
- **Production Checklist:** `PRODUCTION_CHECKLIST.md`
- **File List:** `DEPLOYMENT_FILES.md`

