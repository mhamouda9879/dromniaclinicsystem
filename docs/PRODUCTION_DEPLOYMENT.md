# Production Deployment Guide

## Prerequisites

- Server with HTTPS enabled
- Domain name pointing to your server
- PostgreSQL database (production-ready)
- Telegram Bot Token (from @BotFather)
- Node.js 18+ installed on server

## Step 1: Environment Setup

### Create Production `.env` File

```bash
cd backend
cp .env.example .env.production
```

### Required Environment Variables

```env
# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-db-username
DB_PASSWORD=your-secure-db-password
DB_DATABASE=obgyn_clinic_prod

# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://dromniaclinic.com

# JWT
JWT_SECRET=your-very-secure-random-secret-key-here

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
```

### Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate secure password
openssl rand -base64 24
```

## Step 2: Database Setup

### Create Production Database

```sql
CREATE DATABASE obgyn_clinic_prod;
CREATE USER obgyn_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE obgyn_clinic_prod TO obgyn_user;
```

### Run Migrations

```bash
cd backend
npm run migration:run
```

### Seed Initial Users

```bash
npm run seed:users
```

## Step 3: Build Application

```bash
# Install dependencies
npm install --production

# Build the application
npm run build
```

## Step 4: Set Up Webhook

### Option A: Using the API Endpoint

Once your server is running:

```bash
curl -X POST https://dromniaclinic.com/telegram/set-webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://dromniaclinic.com/telegram/webhook"}'
```

### Option B: Using Telegram API Directly

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://dromniaclinic.com/telegram/webhook",
    "drop_pending_updates": true
  }'
```

### Verify Webhook Setup

```bash
# Check webhook status
curl https://dromniaclinic.com/telegram/webhook-info

# Or via Telegram API
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## Step 5: Start Application

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
cd backend
pm2 start dist/main.js --name obgyn-clinic-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### Using systemd

Create `/etc/systemd/system/obgyn-clinic.service`:

```ini
[Unit]
Description=OB/GYN Clinic Backend
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/obgyn-clinic-system/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl enable obgyn-clinic
sudo systemctl start obgyn-clinic
sudo systemctl status obgyn-clinic
```

### Using Docker (Alternative)

```bash
# Build Docker image
docker build -t obgyn-clinic-backend .

# Run container
docker run -d \
  --name obgyn-clinic \
  -p 3000:3000 \
  --env-file .env.production \
  obgyn-clinic-backend
```

## Step 6: Reverse Proxy Setup (Nginx)

### Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Configure Nginx

Create `/etc/nginx/sites-available/obgyn-clinic`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Backend API
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout for long-running requests
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Webhook endpoint - important for Telegram
    location /telegram/webhook {
        proxy_pass http://localhost:3000/telegram/webhook;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Telegram webhooks may take longer
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/obgyn-clinic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dromniaclinic.com
```

## Step 7: Security Checklist

- [ ] Strong database passwords
- [ ] Secure JWT secret
- [ ] HTTPS enabled
- [ ] Firewall configured (only ports 80, 443 open)
- [ ] Environment variables not in git
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] Rate limiting enabled (if needed)
- [ ] CORS properly configured
- [ ] Bot token secured

## Step 8: Monitoring & Logs

### PM2 Logs

```bash
pm2 logs obgyn-clinic-backend
pm2 monit
```

### Application Logs

Check logs in:
- `backend/logs/` (if configured)
- PM2 logs
- systemd journal: `journalctl -u obgyn-clinic -f`

### Health Check

```bash
curl https://dromniaclinic.com/telegram/health
```

## Step 9: Testing Production Setup

### 1. Test Bot Connection

```bash
curl https://your-domain.com/telegram/test
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully connected to Telegram Bot: @your_bot_username",
  "botInfo": {...}
}
```

### 2. Test Webhook

Send a test message to your bot on Telegram, then check logs:

```bash
pm2 logs obgyn-clinic-backend --lines 50
```

### 3. Test Full Flow

1. Start conversation with bot on Telegram
2. Select language
3. Book an appointment
4. Verify in database

## Step 10: Frontend Deployment

If deploying frontend separately:

```bash
cd frontend
npm install
npm run build

# Serve with Nginx or deploy to CDN
```

Update `REACT_APP_API_URL` in frontend build:
```env
REACT_APP_API_URL=https://dromniaclinic.com
```

## Troubleshooting

### Webhook Not Receiving Updates

1. **Check webhook URL is correct:**
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```

2. **Verify HTTPS is working:**
   ```bash
   curl -I https://dromniaclinic.com/telegram/webhook
   ```

3. **Check server logs:**
   ```bash
   pm2 logs obgyn-clinic-backend
   ```

4. **Verify SSL certificate is valid:**
   ```bash
   openssl s_client -connect dromniaclinic.com:443
   ```

### Bot Not Responding

1. Check bot is running: `pm2 status`
2. Check logs: `pm2 logs obgyn-clinic-backend`
3. Verify webhook is set correctly
4. Test connection: `curl https://your-domain.com/telegram/test`

### Database Connection Issues

1. Verify database is accessible from server
2. Check connection string in `.env`
3. Test connection: `psql -h host -U user -d database`

## Production Maintenance

### Backup Database

```bash
# Daily backup script
pg_dump -h $DB_HOST -U $DB_USERNAME $DB_DATABASE > backup_$(date +%Y%m%d).sql
```

### Update Application

```bash
git pull
npm install --production
npm run build
pm2 restart obgyn-clinic-backend
```

### Monitor Performance

```bash
pm2 monit
# Monitor CPU, memory, and logs
```

## Support

For issues:
1. Check application logs
2. Verify webhook status
3. Test API endpoints
4. Check Telegram Bot API status: https://status.telegram.org

