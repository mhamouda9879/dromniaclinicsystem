# Hostinger Manual Deployment Guide for dromniaclinic.com

## Important: Manual Deployment Required

Hostinger's automated framework detection will show an error because this is a **custom Node.js application**. You need to deploy manually via **File Manager** or **SSH**.

## Step-by-Step Manual Deployment

### Step 1: Prepare Files on Your Computer

#### Build Backend

```bash
cd backend
npm install --production
npm run build
```

#### Build Frontend

```bash
cd frontend
npm install
echo "REACT_APP_API_URL=https://dromniaclinic.com" > .env
npm run build
```

Or use the automated script:
```bash
./deploy-all.sh
```

### Step 2: Create ZIP Files

```bash
./create-deployment-zips.sh
```

This creates:
- `backend-deploy.zip` - Backend files
- `frontend-deploy.zip` - Frontend files

### Step 3: Upload via File Manager

1. **Login to Hostinger hPanel**
2. Go to **File Manager**
3. Navigate to your domain directory (usually `public_html` or `domains/dromniaclinic.com/public_html`)

#### Upload Frontend (Static Files)

1. Upload `frontend-deploy.zip`
2. **Extract** it directly to `public_html/` folder
   - Right-click the zip → Extract
   - Extract all files to `public_html/`
3. Files should be at root level: `public_html/index.html`, `public_html/static/`, etc.

#### Upload Backend (Node.js App)

1. Create a folder: `public_html/backend/` (or `backend/` at root level)
2. Upload `backend-deploy.zip`
3. **Extract** it to the `backend/` folder
4. Create `.env` file in `backend/` folder with these contents:

```env
# Database (from Hostinger MySQL Databases)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_hostinger_db_user
DB_PASSWORD=your_hostinger_db_password
DB_DATABASE=your_hostinger_db_name

# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://dromniaclinic.com

# JWT (generate a secure secret)
JWT_SECRET=your-very-secure-random-secret-key-here

# Telegram
TELEGRAM_BOT_TOKEN=8157914350:AAHHLBPkDj3jQWIGIRvOZx4qJQg0gpnSkUc
```

### Step 4: Install Node.js Dependencies

You have two options:

#### Option A: Via Hostinger Node.js Panel

1. In hPanel, find **Node.js** section
2. Create a new Node.js app
3. Set:
   - **App Name:** obgyn-clinic-backend
   - **Node.js Version:** 18 or higher
   - **App Mode:** Production
   - **App Root Path:** `/backend` or `/public_html/backend`
   - **App Startup File:** `dist/main.js`
4. Set environment variables in the Node.js panel
5. Start the app

#### Option B: Via SSH (if available)

1. **Enable SSH** in Hostinger hPanel (if not already enabled)
2. Connect via SSH:
   ```bash
   ssh username@dromniaclinic.com
   ```
3. Navigate to backend folder:
   ```bash
   cd public_html/backend
   # or
   cd backend
   ```
4. Install dependencies:
   ```bash
   npm install --production
   ```
5. Run migrations:
   ```bash
   npm run migration:run
   npm run seed:users
   ```
6. Start with PM2 (if available):
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name obgyn-clinic
   pm2 save
   ```

### Step 5: Setup Database

1. In hPanel, go to **Databases** → **MySQL Databases**
2. **Create Database:**
   - Database name: `obgyn_clinic` (or your choice)
3. **Create User:**
   - Username: `obgyn_user` (or your choice)
   - Password: (generate secure password)
4. **Grant Privileges:**
   - Grant all privileges to the user on the database
5. **Update `.env` file** with the database credentials

### Step 6: Configure Domain & SSL

1. In hPanel, go to **Domains**
2. Ensure `dromniaclinic.com` is pointing to your hosting
3. **Enable SSL:**
   - Go to **SSL** section
   - Enable SSL certificate (usually free Let's Encrypt)
   - Wait for activation (can take a few minutes)

### Step 7: Setup Webhook

Once backend is running:

#### Via SSH:
```bash
cd backend
npm run setup:webhook https://dromniaclinic.com
```

#### Via API (from your computer):
```bash
curl -X POST "https://api.telegram.org/bot8157914350:AAHHLBPkDj3jQWIGIRvOZx4qJQg0gpnSkUc/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://dromniaclinic.com/telegram/webhook"}'
```

### Step 8: Test Deployment

1. **Test Frontend:**
   - Visit: `https://dromniaclinic.com`
   - Should see your React app

2. **Test Backend:**
   ```bash
   curl https://dromniaclinic.com/telegram/health
   ```

3. **Test Bot:**
   - Send message to `@dromniabot` on Telegram
   - Should receive language selection

## Alternative: Separate Backend Subdomain

If Hostinger's Node.js hosting has limitations, consider:

### Option: Deploy Backend to a Subdomain

1. Create subdomain: `api.dromniaclinic.com`
2. Deploy backend there
3. Update frontend `.env`:
   ```
   REACT_APP_API_URL=https://api.dromniaclinic.com
   ```

## File Structure on Server

After deployment, your server should look like:

```
public_html/
├── index.html              (from frontend build)
├── static/                 (from frontend build)
│   ├── css/
│   ├── js/
│   └── media/
├── backend/                (if using File Manager)
│   ├── dist/
│   ├── node_modules/
│   ├── package.json
│   └── .env
└── ...

OR (if Node.js panel handles it separately):

backend/                    (at root or separate location)
├── dist/
├── node_modules/
├── package.json
└── .env

public_html/                (frontend only)
├── index.html
└── static/
```

## Troubleshooting

### Error: "Unsupported framework or invalid project structure"

✅ **This is normal!** Hostinger's auto-detection doesn't support custom Node.js apps.  
**Solution:** Deploy manually via File Manager or SSH (see steps above)

### Frontend Not Loading

- Check if `index.html` is in `public_html/`
- Verify files were extracted correctly
- Check browser console for errors

### Backend Not Starting

- Check Node.js version (needs 18+)
- Verify `.env` file exists and has correct values
- Check Node.js panel logs
- Verify database connection

### Webhook Not Working

- **Requirement:** Backend must be accessible via HTTPS
- Check SSL is enabled for domain
- Verify backend is running
- Test: `curl https://dromniaclinic.com/telegram/health`

### Database Connection Failed

- Verify database credentials in `.env`
- Check database exists in Hostinger
- Ensure user has privileges
- Test connection via Hostinger's phpMyAdmin

## Quick Checklist

- [ ] Backend built (`npm run build`)
- [ ] Frontend built (`npm run build`)
- [ ] ZIP files created
- [ ] Frontend uploaded and extracted to `public_html/`
- [ ] Backend uploaded and extracted
- [ ] `.env` file created with production values
- [ ] Database created in Hostinger
- [ ] Node.js app configured (if using Node.js panel)
- [ ] Dependencies installed (`npm install --production`)
- [ ] Migrations run
- [ ] Backend service started
- [ ] SSL certificate enabled
- [ ] Webhook configured
- [ ] Tested end-to-end

## Need Help?

1. **Check Logs:**
   - Hostinger Node.js panel → Logs
   - Or SSH: `pm2 logs obgyn-clinic`

2. **Verify Files:**
   - Use File Manager to check files are uploaded correctly

3. **Test Components:**
   - Frontend: Visit domain in browser
   - Backend: `curl https://dromniaclinic.com/telegram/health`
   - Database: Test via phpMyAdmin

## Important Notes

- ⚠️ **Don't use** "Upload your website backup" for custom Node.js apps
- ✅ **Use** File Manager for manual upload
- ✅ **Use** Node.js panel to run the backend
- ✅ **Requires** SSL (HTTPS) for Telegram webhook to work
- ✅ **Requires** Node.js 18+ support in your Hostinger plan

