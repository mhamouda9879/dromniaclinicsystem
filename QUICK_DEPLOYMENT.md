# Quick Deployment Guide for dromniaclinic.com

## Your Domain: `dromniaclinic.com`

## Quick Setup Steps

### 1. Set Webhook (After Server is Running)

```bash
cd backend
npm run setup:webhook https://dromniaclinic.com
```

This will:
- ✅ Check current webhook status
- ✅ Test server accessibility
- ✅ Set webhook to `https://dromniaclinic.com/telegram/webhook`
- ✅ Verify webhook is working

### 2. Verify Webhook

```bash
npm run check:webhook
```

### 3. Test Endpoints

```bash
# Health check
curl https://dromniaclinic.com/telegram/health

# Test bot connection
curl https://dromniaclinic.com/telegram/test
```

## Webhook URL

Your production webhook URL is:
```
https://dromniaclinic.com/telegram/webhook
```

## Environment Variables

Make sure your `.env` has:

```env
TELEGRAM_BOT_TOKEN=your-token-here
FRONTEND_URL=https://dromniaclinic.com
NODE_ENV=production
```

## Manual Webhook Setup (Alternative)

If you prefer to set it manually:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://dromniaclinic.com/telegram/webhook",
    "drop_pending_updates": true
  }'
```

## Testing

1. **Send a message** to your bot `@dromniabot` on Telegram
2. **Check server logs** - you should see webhook requests
3. **Verify bot responds** with language selection

## Troubleshooting

### Webhook not working?

1. Check if server is running:
   ```bash
   curl https://dromniaclinic.com/telegram/health
   ```

2. Check webhook status:
   ```bash
   npm run check:webhook
   ```

3. Verify HTTPS is working:
   ```bash
   curl -I https://dromniaclinic.com/telegram/webhook
   ```

4. Check SSL certificate:
   ```bash
   openssl s_client -connect dromniaclinic.com:443
   ```

## Next Steps

1. ✅ Deploy your backend to server with HTTPS
2. ✅ Run: `npm run setup:webhook https://dromniaclinic.com`
3. ✅ Test by sending message to bot
4. ✅ Monitor logs for any errors

Your domain `dromniaclinic.com` is ready for production! 🚀

