# Quick Telegram Testing Guide

## 🚀 Quick Start Testing

### 1. Test Your Configuration

```bash
cd backend
npm run test:telegram
```

This will test:
- ✅ Token exists in `.env`
- ✅ Token format is valid
- ✅ Connection to Telegram API
- ✅ Webhook status

### 2. Test Sending a Message

**First, get your chat ID:**
1. Start a conversation with your bot on Telegram
2. Send any message
3. Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. Find `"chat":{"id":123456789}` in the response

**Then test:**
```bash
npm run test:telegram 123456789
```
(Replace with your actual chat ID)

### 3. Test via API (Backend Running)

```bash
# Start backend
cd backend
npm run start:dev

# In another terminal, test endpoints:

# Health check
curl http://localhost:3000/telegram/health

# Test connection
curl http://localhost:3000/telegram/test

# Test sending message
curl -X POST http://localhost:3000/telegram/test-message \
  -H "Content-Type: application/json" \
  -d '{"chatId": "123456789"}'
```

### 4. Test Full Bot Conversation

1. **Set webhook** (local dev with ngrok):
   ```bash
   # Terminal 1: Start backend
   cd backend && npm run start:dev
   
   # Terminal 2: Start ngrok
   ngrok http 3000
   
   # Terminal 3: Set webhook
   curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-ngrok-url.ngrok.io/telegram/webhook"}'
   ```

2. **Test on Telegram:**
   - Open Telegram app
   - Find your bot
   - Send "menu" or "/start"
   - Follow booking flow

## 📋 Test Checklist

- [ ] Token configured in `.env`
- [ ] `npm run test:telegram` passes
- [ ] Backend starts without errors
- [ ] Health endpoint returns success
- [ ] Can send test message
- [ ] Bot responds to "menu"
- [ ] Booking flow works

## 🔧 Troubleshooting

**"Token not set"** → Add `TELEGRAM_BOT_TOKEN=...` to `backend/.env`

**"Invalid token"** → Get new token from [@BotFather](https://t.me/botfather)

**"Chat not found"** → Start conversation with bot first

**"Connection failed"** → Check internet, verify token

For detailed testing guide, see: [docs/TELEGRAM_TESTING.md](docs/TELEGRAM_TESTING.md)

