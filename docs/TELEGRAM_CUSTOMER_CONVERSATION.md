# Handling Customer Conversations via Telegram

## Quick Start

### Send Welcome Message to Customer

When a customer first contacts the bot, you can send them a welcome message:

```bash
cd backend
npm run send:welcome <chatId>
```

**Example:**
```bash
npm run send:welcome 1099690423
```

### Customer Information

From the webhook data you provided:
- **Chat ID**: `1099690423`
- **Name**: Mohamed Hamouda
- **Username**: @MohHamouda
- **First Message**: "Hii"

## Conversation Flow

### 1. Initial Contact

When a customer sends their first message (like "Hii", "Hello", "Hi"), the bot will:

✅ **Automatically detect greetings** (hi, hello, hey, hii, etc.)
✅ **Show the main menu** with all available options
✅ **Create a conversation session** for the customer

### 2. Main Menu Options

Customers can reply with numbers **1-10** to select:

1. Book Pregnancy Visit (First visit / Follow-up)
2. Book Ultrasound (Pregnancy / Vaginal)
3. Postpartum Follow-up
4. Family Planning
5. Infertility / Trying to Conceive
6. General Gynecology Issues
7. Pap Smear / Cervical Screening
8. Emergency Case
9. Modify / Cancel Appointment
10. Check My Queue Number

### 3. Booking Flow

The bot will guide customers through:
- Providing their name
- Entering relevant medical information (LMP, symptoms, etc.)
- Selecting available dates
- Choosing time slots
- Confirming the appointment

## Testing the Conversation

### Option 1: Through Telegram (Recommended)

1. **Make sure backend is running:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Set up webhook** (if not already set):
   ```bash
   # For local testing with ngrok:
   ngrok http 3000
   
   # Then set webhook:
   curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-ngrok-url.ngrok.io/telegram/webhook"}'
   ```

3. **Start conversation on Telegram:**
   - Open Telegram
   - Find your bot (@dromniabot)
   - Send "menu" or "start" or any greeting
   - Follow the prompts

### Option 2: Send Test Messages via API

```bash
# Send welcome message
npm run send:welcome 1099690423

# Or send custom message via API
curl -X POST http://localhost:3000/telegram/test-message \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": 1099690423,
    "message": "Your custom message here"
  }'
```

## Understanding Webhook Data

When a customer sends a message, Telegram sends a webhook like:

```json
{
  "ok": true,
  "result": [{
    "update_id": 333105128,
    "message": {
      "message_id": 3,
      "from": {
        "id": 1099690423,
        "is_bot": false,
        "first_name": "Mohamed",
        "last_name": "Hamouda",
        "username": "MohHamouda"
      },
      "chat": {
        "id": 1099690423,
        "first_name": "Mohamed",
        "last_name": "Hamouda",
        "username": "MohHamouda",
        "type": "private"
      },
      "date": 1765415267,
      "text": "Hii"
    }
  }]
}
```

**Key Information:**
- `chat.id` = **1099690423** (use this for sending messages)
- `from.first_name` = "Mohamed" (customer's first name)
- `from.username` = "@MohHamouda" (Telegram username)
- `text` = "Hii" (customer's message)

## Customer Interaction Examples

### Customer says "Hi" or "Hello"
✅ Bot responds with main menu automatically

### Customer sends "menu" or "start"
✅ Bot responds with main menu

### Customer sends "1" (Book Pregnancy Visit)
✅ Bot asks: "Is this your first pregnancy visit or a follow-up?"
✅ Customer replies: "1" (first visit) or "2" (follow-up)
✅ Bot guides through booking process

### Customer sends "10" (Check Queue)
✅ Bot checks if customer has appointment today
✅ Shows queue position and estimated wait time

## Monitoring Conversations

### Check Backend Logs

When customers interact with the bot, you'll see logs like:

```
[TelegramService] Bot validated: @dromniabot (Dr.Omnia Clinic Bot)
[ConversationService] Processing message from chat 1099690423
[TelegramService] Sending message to chat 1099690423
```

### View Conversation State

Conversations are stored in memory (during active session). Each conversation:
- **Session Timeout**: 30 minutes of inactivity
- **State**: Current step in conversation (menu, booking, etc.)
- **Data**: Collected information (name, dates, etc.)

## Troubleshooting

### Customer Not Receiving Messages

1. **Check if webhook is set:**
   ```bash
   curl http://localhost:3000/telegram/webhook-info
   ```

2. **Check if bot is blocked:**
   - If customer blocked the bot, messages will fail
   - Customer needs to unblock the bot first

3. **Verify chat ID:**
   - Make sure you're using the correct chat ID
   - Get it from webhook updates or getUpdates API

### Bot Not Responding

1. **Check backend is running:**
   ```bash
   # Should see: "🚀 Application is running on: http://localhost:3000"
   ```

2. **Check webhook is receiving updates:**
   - Monitor backend logs for incoming webhook requests
   - Check `/telegram/webhook-info` endpoint

3. **Verify token is valid:**
   ```bash
   npm run test:telegram
   ```

## Customer Support Workflow

1. **Customer contacts bot** → Bot sends welcome message
2. **Customer selects service** → Bot guides through booking
3. **Appointment confirmed** → Bot sends confirmation message
4. **Automated reminders** → Bot sends reminders (24h, 1h, 30min before)
5. **Queue updates** → Bot notifies when it's their turn
6. **After visit** → Bot sends thank you message

## Quick Reference Commands

```bash
# Test bot configuration
npm run test:telegram

# Send welcome to customer
npm run send:welcome <chatId>

# Test sending message
npm run test:telegram <chatId>

# Check webhook status
curl http://localhost:3000/telegram/health

# Get bot info
curl http://localhost:3000/telegram/bot-info
```

## Next Steps

1. ✅ Welcome message sent to customer (Chat ID: 1099690423)
2. ✅ Bot is ready to respond to customer messages
3. 🔄 Customer can now interact with bot on Telegram
4. 📊 Monitor conversations via backend logs
5. 📝 Appointments will be automatically created in database

The bot is now ready to handle customer conversations! 🎉

