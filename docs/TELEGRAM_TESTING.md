# Telegram Bot Testing Guide

This guide explains how to test your Telegram bot integration to ensure everything is working correctly.

## Quick Test

### 1. Test Configuration (Standalone Script)

Run the test script to validate your bot token and configuration:

```bash
cd backend
npm run test:telegram
```

This will:
- ✅ Check if token exists in `.env`
- ✅ Validate token format
- ✅ Test connection to Telegram API
- ✅ Check webhook configuration
- ✅ Optionally test sending a message

**To test sending a message**, provide a chat ID:
```bash
npm run test:telegram 123456789
```
(Replace `123456789` with your actual Telegram chat ID)

### 2. Test via API Endpoints

Start your backend server:
```bash
cd backend
npm run start:dev
```

Then test the endpoints:

#### Health Check
```bash
curl http://localhost:3000/telegram/health
```

Response:
```json
{
  "configured": true,
  "connection": {
    "success": true,
    "message": "Successfully connected to Telegram Bot: @your_bot_username",
    "botInfo": {
      "id": 123456789,
      "is_bot": true,
      "first_name": "OB/GYN Clinic Bot",
      "username": "your_bot_username"
    }
  },
  "webhook": {
    "url": "https://your-webhook-url.com/telegram/webhook",
    "pending_update_count": 0
  }
}
```

#### Test Connection
```bash
curl http://localhost:3000/telegram/test
```

#### Get Bot Info
```bash
curl http://localhost:3000/telegram/bot-info
```

#### Get Webhook Info
```bash
curl http://localhost:3000/telegram/webhook-info
```

#### Test Sending Message
```bash
curl -X POST http://localhost:3000/telegram/test-message \
  -H "Content-Type: application/json" \
  -d '{"chatId": "123456789", "message": "Hello from the clinic bot!"}'
```

## Step-by-Step Testing Process

### Step 1: Verify Token Configuration

1. **Check `.env` file** in `backend/` directory:
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

2. **Run test script**:
   ```bash
   npm run test:telegram
   ```

   Expected output:
   ```
   ✅ Token format is valid
   ✅ Successfully connected to bot: @your_bot_username
   ```

### Step 2: Get Your Chat ID

To test sending messages, you need your Telegram chat ID:

1. **Start a conversation** with your bot on Telegram
2. **Send any message** to the bot (e.g., "/start" or "hello")
3. **Check webhook logs** in your backend console, or
4. **Use this method**:
   - Start conversation with your bot
   - Send a message
   - Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Look for `"chat":{"id":123456789}` in the response

### Step 3: Test Bot Responses

#### Method 1: Via Telegram (Recommended)

1. **Start backend server**:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Set up webhook** (for local development with ngrok):
   ```bash
   # Start ngrok in another terminal
   ngrok http 3000
   
   # Set webhook
   curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-ngrok-url.ngrok.io/telegram/webhook"}'
   ```

3. **Start conversation** with your bot on Telegram
4. **Send "menu"** - you should receive the main menu
5. **Try booking flow** - follow the prompts

#### Method 2: Via API Endpoint

Test sending a message directly:
```bash
curl -X POST http://localhost:3000/telegram/test-message \
  -H "Content-Type: application/json" \
  -d '{"chatId": "YOUR_CHAT_ID"}'
```

### Step 4: Test Complete Booking Flow

1. **Start conversation** with bot on Telegram
2. **Send "menu"** or "/start"
3. **Select option 1** (Book Pregnancy Visit)
4. **Follow the prompts**:
   - Enter your name
   - Enter LMP date (DD/MM/YYYY)
   - Answer questions
   - Select date and time
   - Confirm booking
5. **Verify appointment** was created in database

### Step 5: Test Queue Status

1. **Book an appointment** (or use existing one)
2. **Send "10"** or "check queue" to the bot
3. **Verify** you receive queue status

## Common Test Cases

### ✅ Test Case 1: Valid Token
```bash
# Expected: ✅ All tests pass
npm run test:telegram
```

### ✅ Test Case 2: Invalid Token
```bash
# Set invalid token in .env
TELEGRAM_BOT_TOKEN=invalid_token

# Expected: ❌ Connection failed / Unauthorized
npm run test:telegram
```

### ✅ Test Case 3: Missing Token
```bash
# Remove or comment out TELEGRAM_BOT_TOKEN in .env

# Expected: ❌ Token not set
npm run test:telegram
```

### ✅ Test Case 4: Bot Blocked
```bash
# Block the bot in Telegram, then try to send message

# Expected: ❌ Bot was blocked by the user
curl -X POST http://localhost:3000/telegram/test-message \
  -d '{"chatId": "BLOCKED_CHAT_ID"}'
```

### ✅ Test Case 5: Chat Not Found
```bash
# Use invalid chat ID

# Expected: ❌ Chat not found
curl -X POST http://localhost:3000/telegram/test-message \
  -d '{"chatId": "999999999"}'
```

## Error Scenarios & Solutions

### Error: "TELEGRAM_BOT_TOKEN is not set"
**Solution**: Add token to `backend/.env` file

### Error: "Invalid bot token - Unauthorized"
**Solution**: 
- Check token is correct
- Get new token from @BotFather
- Ensure no extra spaces in `.env` file

### Error: "Chat not found"
**Solution**: 
- User must start conversation with bot first
- Get correct chat ID from getUpdates API
- Verify chat ID is a number (not string)

### Error: "Bot was blocked"
**Solution**: 
- User must unblock the bot
- Check if bot is still active with @BotFather

### Error: "Rate limit exceeded"
**Solution**: 
- Wait a few minutes
- Reduce message frequency
- Implement rate limiting in your code

## Automated Testing

### Test All Endpoints

Create a test script (`test-all.sh`):
```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing Telegram endpoints..."
echo ""

echo "1. Health Check:"
curl -s "$BASE_URL/telegram/health" | jq
echo ""

echo "2. Test Connection:"
curl -s "$BASE_URL/telegram/test" | jq
echo ""

echo "3. Bot Info:"
curl -s "$BASE_URL/telegram/bot-info" | jq
echo ""

echo "4. Webhook Info:"
curl -s "$BASE_URL/telegram/webhook-info" | jq
echo ""
```

Run with:
```bash
chmod +x test-all.sh
./test-all.sh
```

## Monitoring & Debugging

### Check Backend Logs

When backend starts, you should see:
```
✅ Telegram Bot Token found in configuration
✅ Telegram Bot is connected and ready!
Bot validated: @your_bot_username (OB/GYN Clinic Bot)
```

### Enable Debug Logging

In `telegram.service.ts`, check for:
- `logger.log()` - Success messages
- `logger.error()` - Error messages
- `console.log()` - Additional debug info

### Check Telegram API Directly

Test API directly:
```bash
# Get bot info
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getMe"

# Get updates (if webhook not set)
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates"

# Get webhook info
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo"
```

## Production Testing Checklist

Before going to production:

- [ ] Token is valid and tested
- [ ] Webhook is set correctly
- [ ] HTTPS webhook URL is working
- [ ] Bot responds to menu command
- [ ] Booking flow works end-to-end
- [ ] Queue status check works
- [ ] Error handling works (blocked users, etc.)
- [ ] Rate limiting is handled
- [ ] Logs are monitored
- [ ] Database migrations are complete

## Next Steps

After successful testing:

1. Set up webhook for production
2. Test with real users
3. Monitor logs for errors
4. Set up error alerts
5. Document any custom flows

For more information, see:
- [Telegram Setup Guide](./TELEGRAM_SETUP_GUIDE.md)
- [Telegram Migration Guide](../TELEGRAM_MIGRATION.md)

