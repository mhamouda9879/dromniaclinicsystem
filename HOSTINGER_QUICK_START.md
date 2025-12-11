# Hostinger Quick Start - dromniaclinic.com

## ⚠️ Important

The error "Unsupported framework or invalid project structure" is **NORMAL**.  
Hostinger's auto-detection doesn't work with custom Node.js apps.

**Solution: Deploy manually using File Manager**

## 🚀 Quick Steps

### 1. Prepare Files (On Your Computer)

```bash
# Build everything
./create-deployment-zips.sh
```

This creates:
- `backend-deploy.zip`
- `frontend-deploy.zip`

### 2. Upload via File Manager

#### Frontend (Static Website)

1. **Login** to Hostinger hPanel
2. Open **File Manager**
3. Go to `public_html/` folder
4. **Upload** `frontend-deploy.zip`
5. **Extract** it directly to `public_html/`
6. Files should be: `public_html/index.html`, `public_html/static/`, etc.

#### Backend (Node.js App)

1. In File Manager, create folder: `backend/` (in `public_html/` or root)
2. **Upload** `backend-deploy.zip`
3. **Extract** to `backend/` folder
4. Create `.env` file in `backend/` folder:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=obgyn_clinic
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://dromniaclinic.com
JWT_SECRET=generate-secure-secret
TELEGRAM_BOT_TOKEN=8157914350:AAHHLBPkDj3jQWIGIRvOZx4qJQg0gpnSkUc
```

### 3. Setup Database

1. hPanel → **Databases** → **MySQL Databases**
2. **Create Database:** `obgyn_clinic`
3. **Create User** with password
4. **Grant privileges**
5. Update `.env` with credentials

### 4. Run Backend (Node.js Panel)

1. hPanel → **Node.js** (if available)
2. **Create App:**
   - Name: `obgyn-clinic-backend`
   - Version: 18+
   - Path: `/backend` or `/public_html/backend`
   - Startup: `dist/main.js`
3. **Add Environment Variables** from `.env`
4. **Start App**

OR via SSH:
```bash
ssh username@dromniaclinic.com
cd backend
npm install --production
npm run migration:run
pm2 start dist/main.js --name obgyn-clinic
```

### 5. Setup Webhook

Once backend is running:

```bash
cd backend
npm run setup:webhook https://dromniaclinic.com
```

Or manually:
```bash
curl -X POST "https://api.telegram.org/bot8157914350:AAHHLBPkDj3jQWIGIRvOZx4qJQg0gpnSkUc/setWebhook" \
  -d '{"url": "https://dromniaclinic.com/telegram/webhook"}'
```

### 6. Test

- Frontend: Visit `https://dromniaclinic.com`
- Backend: `curl https://dromniaclinic.com/telegram/health`
- Bot: Send message to `@dromniabot`

## 📁 Files to Upload

✅ **Frontend:** Upload `frontend-deploy.zip` → Extract to `public_html/`  
✅ **Backend:** Upload `backend-deploy.zip` → Extract to `backend/` folder  
✅ **Config:** Create `.env` file manually in `backend/` folder

## ❌ Don't Use

- ❌ "Upload your website backup" feature (causes the error you saw)
- ❌ Automated framework detection

## ✅ Use Instead

- ✅ File Manager for manual upload
- ✅ Node.js panel to run backend
- ✅ Manual configuration

## Need More Details?

See: `docs/HOSTINGER_MANUAL_DEPLOYMENT.md`

