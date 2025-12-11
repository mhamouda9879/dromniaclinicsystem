# Production Deployment Checklist

## Pre-Deployment

- [ ] **Environment Variables**
  - [ ] All sensitive values set in production `.env`
  - [ ] Database credentials secure
  - [ ] JWT secret is strong and unique
  - [ ] Telegram bot token is correct
  - [ ] No secrets committed to git

- [ ] **Database**
  - [ ] Production database created
  - [ ] Migrations tested
  - [ ] Backup strategy in place
  - [ ] Connection string verified

- [ ] **Server**
  - [ ] Server has HTTPS enabled
  - [ ] Domain name configured
  - [ ] Firewall rules set
  - [ ] SSL certificate valid

- [ ] **Application**
  - [ ] Code built successfully (`npm run build`)
  - [ ] All tests passing
  - [ ] No console errors in logs
  - [ ] Error handling implemented

## Deployment Steps

### 1. Server Setup

```bash
# On your production server
git clone <your-repo>
cd obgyn-clinic-system/backend
npm install --production
cp .env.example .env
# Edit .env with production values
```

### 2. Database Setup

```bash
# Create database
createdb obgyn_clinic_prod

# Run migrations
npm run migration:run

# Seed initial users
npm run seed:users
```

### 3. Build Application

```bash
npm run build
```

### 4. Set Up Webhook

```bash
# Set webhook to your production URL
npm run setup:webhook https://dromniaclinic.com
```

### 5. Start Application

```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start dist/main.js --name obgyn-clinic
pm2 save
pm2 startup
```

## Post-Deployment Verification

- [ ] **Health Check**
  ```bash
  curl https://dromniaclinic.com/telegram/health
  ```

- [ ] **Bot Connection**
  ```bash
  curl https://dromniaclinic.com/telegram/test
  ```

- [ ] **Webhook Status**
  ```bash
  npm run check:webhook
  ```

- [ ] **Test Bot**
  - [ ] Send message to bot on Telegram
  - [ ] Bot responds correctly
  - [ ] Language selection works
  - [ ] Booking flow completes
  - [ ] Appointment appears in database

- [ ] **Monitoring**
  - [ ] Logs are being written
  - [ ] Error tracking configured
  - [ ] Performance monitoring active

## Production Webhook Setup

### Quick Setup

```bash
cd backend
npm run setup:webhook https://dromniaclinic.com
```

### Manual Setup

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://dromniaclinic.com/telegram/webhook",
    "drop_pending_updates": true
  }'
```

### Verify Webhook

```bash
npm run check:webhook
```

## Security Checklist

- [ ] HTTPS enabled (required for webhook)
- [ ] Strong passwords for all services
- [ ] Firewall configured (ports 80, 443 only)
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Regular backups configured
- [ ] Log rotation enabled
- [ ] Error messages don't expose sensitive info

## Monitoring

### Application Logs

```bash
# PM2 logs
pm2 logs obgyn-clinic

# Real-time monitoring
pm2 monit
```

### Webhook Health

Check regularly:
```bash
npm run check:webhook
```

### Database

Monitor:
- Connection pool usage
- Query performance
- Disk space
- Backup completion

## Troubleshooting

### Webhook Issues

1. **Not receiving messages:**
   ```bash
   npm run check:webhook
   # Check for errors in webhook info
   ```

2. **HTTPS not working:**
   ```bash
   curl -I https://dromniaclinic.com/telegram/webhook
   # Should return 200 or 404, not connection error
   ```

3. **SSL certificate issues:**
   - Verify certificate is valid
   - Check certificate expiration
   - Ensure domain matches certificate

### Bot Not Responding

1. Check if application is running:
   ```bash
   pm2 status
   ```

2. Check logs for errors:
   ```bash
   pm2 logs obgyn-clinic --lines 100
   ```

3. Verify webhook is set:
   ```bash
   npm run check:webhook
   ```

4. Test bot connection:
   ```bash
   curl https://dromniaclinic.com/telegram/test
   ```

## Maintenance

### Regular Tasks

- [ ] **Daily:** Check application logs
- [ ] **Daily:** Verify webhook status
- [ ] **Weekly:** Review error logs
- [ ] **Weekly:** Check database backups
- [ ] **Monthly:** Review security updates
- [ ] **Monthly:** Performance review

### Updates

```bash
# Pull latest code
git pull

# Install dependencies
npm install --production

# Run migrations (if any)
npm run migration:run

# Rebuild
npm run build

# Restart application
pm2 restart obgyn-clinic
```

## Support Contacts

- **Telegram Bot API Status:** https://status.telegram.org
- **Application Logs:** Check PM2/systemd logs
- **Webhook Status:** `npm run check:webhook`

## Emergency Rollback

If issues occur:

```bash
# Stop application
pm2 stop obgyn-clinic

# Revert to previous version
git checkout <previous-commit>
npm run build
pm2 restart obgyn-clinic

# Or restore from backup
```

## Success Criteria

✅ Bot responds to messages  
✅ Webhook is healthy  
✅ Appointments are being created  
✅ No errors in logs  
✅ Database connections stable  
✅ HTTPS working correctly  

Once all items are checked, your production deployment is complete! 🎉

