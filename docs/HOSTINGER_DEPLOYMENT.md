# Hostinger Deployment Guide for dromniaclinic.com

## Prerequisites

- Hostinger hosting account
- Domain `dromniaclinic.com` configured
- SSH access (if available) or File Manager access
- Node.js support (check Hostinger plan)

## Option 1: Deployment via File Manager (Simple)

### Step 1: Build Your Application

On your local machine:

```bash
# Build backend
cd backend
npm install --production
npm run build

# Build frontend  
cd ../frontend
npm install
echo "REACT_APP_API_URL=https://dromniaclinic.com" > .env
npm run build
```

### Step 2: Prepare Files for Upload

#### Backend Files

Create a zip file with:
- `backend/dist/` (entire folder)
- `backend/package.json`
- `backend/package-lock.json`

```bash
cd backend
zip -r backend-deploy.zip dist/ package.json package-lock.json
```

**Important:** Create `.env` file separately (don't zip it):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=obgyn_clinic
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://dromniaclinic.com
JWT_SECRET=your-secure-secret
TELEGRAM_BOT_TOKEN=8157914350:AAHHLBPkDj3jQWIGIRvOZx4qJQg0gpnSkUc
```

#### Frontend Files

The frontend `build/` folder contains all static files:

```bash
cd frontend/build
zip -r frontend-deploy.zip .
```

### Step 3: Upload to Hostinger

1. **Login to Hostinger** → hPanel
2. **Open File Manager**
3. Navigate to your domain directory (usually `public_html` or `www`)
4. **Upload backend files:**
   - Upload `backend-deploy.zip`
   - Extract it to a `backend/` folder
   - Create `.env` file in `backend/` folder with production values
5. **Upload frontend files:**
   - Upload `frontend-deploy.zip`
   - Extract contents directly to `public_html/` or create a subfolder

### Step 4: Install Dependencies (via SSH or Node.js Panel)

If you have SSH access:

```bash
cd backend
npm install --production
```

Or use Hostinger's Node.js panel if available.

### Step 5: Set Up Database

1. In Hostinger hPanel, go to **Databases** → **MySQL Databases**
2. Create a new database: `obgyn_clinic`
3. Create a database user and grant privileges
4. Update `.env` file with database credentials

### Step 6: Run Migrations

Via SSH or Node.js panel:

```bash
cd backend
npm run migration:run
npm run seed:users
```

### Step 7: Start Backend

If you have Node.js hosting:

```bash
cd backend
node dist/main.js
```

Or use PM2 if available:
```bash
pm2 start dist/main.js --name obgyn-clinic
```

## Option 2: Deployment via SSH (Recommended)

### Step 1: Build Locally

```bash
# Use the deployment script
chmod +x deploy-all.sh
./deploy-all.sh
```

### Step 2: Transfer Files via SCP

```bash
# Transfer backend
scp -r backend/dist backend/package.json backend/package-lock.json \
  user@dromniaclinic.com:/path/to/backend/

# Transfer frontend
scp -r frontend/build/* user@dromniaclinic.com:/path/to/public_html/
```

### Step 3: SSH into Server

```bash
ssh user@dromniaclinic.com
```

### Step 4: Setup on Server

```bash
# Install backend dependencies
cd /path/to/backend
npm install --production

# Create .env file
nano .env
# (paste your production environment variables)

# Run migrations
npm run migration:run
npm run seed:users

# Start backend with PM2
pm2 start dist/main.js --name obgyn-clinic
pm2 save
```

## Option 3: Git-Based Deployment

### On Server

```bash
# Clone repository
git clone <your-repo-url>
cd obgyn-clinic-system

# Build backend
cd backend
npm install --production
npm run build

# Build frontend
cd ../frontend
npm install
npm run build

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Setup database and start
npm run migration:run
pm2 start dist/main.js --name obgyn-clinic
```

## Frontend Deployment (Static Files)

### Option A: Direct to public_html

Upload `frontend/build/` contents directly to `public_html/`

### Option B: Subdomain

Create subdomain `app.dromniaclinic.com` and deploy there

## Backend Deployment

### Node.js Application

If Hostinger supports Node.js:

1. Create Node.js app in hPanel
2. Set Node.js version (18+)
3. Point to: `backend/dist/main.js`
4. Set environment variables in hPanel
5. Start application

### Using PM2 (if SSH available)

```bash
npm install -g pm2
cd backend
pm2 start dist/main.js --name obgyn-clinic
pm2 startup
pm2 save
```

## Database Setup

1. **Create Database:**
   - Go to hPanel → Databases → MySQL Databases
   - Create: `obgyn_clinic_prod`

2. **Create User:**
   - Create database user
   - Grant all privileges

3. **Update .env:**
   ```
   DB_HOST=localhost
   DB_DATABASE=obgyn_clinic_prod
   DB_USERNAME=your_user
   DB_PASSWORD=your_password
   ```

## Webhook Setup

After backend is running:

```bash
# SSH into server
ssh user@dromniaclinic.com

# Set webhook
cd backend
npm run setup:webhook https://dromniaclinic.com
```

Or manually:
```bash
curl -X POST "https://api.telegram.org/bot8157914350:AAHHLBPkDj3jQWIGIRvOZx4qJQg0gpnSkUc/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://dromniaclinic.com/telegram/webhook"}'
```

## Nginx Configuration (If Available)

If you have VPS or can configure Nginx:

```nginx
server {
    listen 80;
    server_name dromniaclinic.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name dromniaclinic.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/key.key;

    # Frontend (Static files)
    location / {
        root /path/to/public_html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Telegram webhook
    location /telegram/webhook {
        proxy_pass http://localhost:3000/telegram/webhook;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_read_timeout 60s;
    }
}
```

## Testing

1. **Test Backend:**
   ```bash
   curl https://dromniaclinic.com/telegram/health
   ```

2. **Test Webhook:**
   ```bash
   npm run check:webhook
   ```

3. **Test Bot:**
   - Send message to @dromniabot on Telegram
   - Should receive language selection

## Troubleshooting

### Backend Not Starting

- Check Node.js version: `node --version` (needs 18+)
- Check logs: `pm2 logs obgyn-clinic`
- Verify .env file exists and has correct values

### Frontend Not Loading

- Check if files are in correct directory
- Verify API URL in frontend build
- Check browser console for errors

### Webhook Not Working

- Verify HTTPS is enabled
- Check backend is running
- Verify webhook URL is correct
- Check server logs

## Quick Checklist

- [ ] Backend built and deployed
- [ ] Frontend built and deployed
- [ ] Database created and configured
- [ ] Environment variables set
- [ ] Migrations run
- [ ] Backend service started
- [ ] Webhook configured
- [ ] HTTPS enabled
- [ ] Tested end-to-end

## Support

For Hostinger-specific issues:
- Hostinger Support: Check hPanel help section
- Hostinger Community: community.hostinger.com

For application issues:
- Check application logs
- Verify environment variables
- Test individual components

