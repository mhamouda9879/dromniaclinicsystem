# Telegram Bot Setup Guide

This guide will walk you through setting up a Telegram bot for the OB/GYN Clinic System.

## Prerequisites

- A Telegram account
- Access to the backend server (for webhook setup)
- Basic knowledge of command-line tools

## Step 1: Create a Telegram Bot

1. **Open Telegram** and search for [@BotFather](https://t.me/botfather)
2. **Start a conversation** with BotFather by clicking "Start"
3. **Create a new bot** by sending the command:
   ```
   /newbot
   ```
4. **Follow the prompts**:
   - Enter a name for your bot (e.g., "OB/GYN Clinic Bot")
   - Enter a username for your bot (must end with `bot`, e.g., "obgyn_clinic_bot")
5. **Save your Bot Token**: BotFather will provide you with a token that looks like:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
   ⚠️ **IMPORTANT**: Keep this token secret and secure!

## Step 2: Configure Environment Variables

1. **Open** `backend/.env` file
2. **Add** the following environment variable:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```
   Replace `your_bot_token_here` with the token you received from BotFather.

3. **Optional**: Set your webhook URL (if you know it):
   ```env
   TELEGRAM_WEBHOOK_URL=https://your-domain.com/telegram/webhook
   ```

## Step 3: Set Up Webhook (Production)

For production, you need to set up a webhook so Telegram can send messages to your server.

### Option A: Using the API Endpoint

Once your backend is running, you can set the webhook using the provided endpoint:

```bash
curl -X POST http://localhost:3000/telegram/set-webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/telegram/webhook"}'
```

### Option B: Using Telegram API Directly

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/telegram/webhook"}'
```

Replace:
- `<YOUR_BOT_TOKEN>` with your actual bot token
- `https://your-domain.com` with your actual domain

## Step 4: Set Up Webhook for Local Development

For local development, you'll need to expose your local server to the internet using a tunneling service.

### Using ngrok

1. **Install ngrok** from [https://ngrok.com](https://ngrok.com)
2. **Start your backend server**:
   ```bash
   cd backend
   npm run start:dev
   ```
3. **In a new terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```
4. **Copy the HTTPS URL** from ngrok (e.g., `https://abc123.ngrok.io`)
5. **Set the webhook**:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://abc123.ngrok.io/telegram/webhook"}'
   ```

⚠️ **Note**: The ngrok URL changes every time you restart ngrok (unless you have a paid plan). You'll need to update the webhook each time.

### Alternative: Using Cloudflare Tunnel or Similar

You can use other tunneling services like:
- Cloudflare Tunnel
- LocalTunnel
- serveo.net

## Step 5: Verify Webhook Setup

Check if your webhook is configured correctly:

```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

Or use the API endpoint:

```bash
curl http://localhost:3000/telegram/webhook-info
```

You should see information about your webhook URL and status.

## Step 6: Test Your Bot

1. **Open Telegram** and search for your bot using its username
2. **Start a conversation** with your bot by clicking "Start"
3. **Send a message** like "hello" or "menu"
4. **You should receive** the main menu with options

## Step 7: Database Migration

Since we've added Telegram fields to the Patient entity, you need to run a database migration:

1. **Generate a migration**:
   ```bash
   cd backend
   npm run migration:generate -- -n AddTelegramFields
   ```

2. **Run the migration**:
   ```bash
   npm run migration:run
   ```

Or manually add the columns to your database:

```sql
ALTER TABLE patients 
ADD COLUMN "telegramChatId" BIGINT UNIQUE,
ADD COLUMN "telegramUsername" VARCHAR(100);
```

## How It Works

### User Flow

1. **Patient starts conversation**: Patient finds your bot on Telegram and clicks "Start"
2. **Bot sends main menu**: The conversation service processes the start and sends the main menu
3. **Patient selects option**: Patient replies with a number (1-10) to select a service
4. **Conversation flow**: The bot guides the patient through booking:
   - Collects name
   - Collects relevant medical information (LMP, symptoms, etc.)
   - Shows available dates and times
   - Confirms the appointment
5. **Appointment created**: Appointment is saved to the database
6. **Notifications sent**: Automated reminders and updates are sent via Telegram

### Bot Capabilities

- **Main Menu**: Provides 10 options for different services
- **Appointment Booking**: Full booking flow through conversation
- **Queue Status**: Patients can check their queue position
- **Notifications**: Automated reminders (24h, 1h, 30min before appointment)
- **Queue Updates**: Real-time queue position updates
- **Emergency Triage**: Special handling for emergency cases

## Security Considerations

1. **Protect Your Bot Token**: Never commit your bot token to version control
2. **Use HTTPS**: Always use HTTPS for webhooks in production
3. **Validate Requests**: The webhook endpoint should validate incoming requests (Telegram provides verification methods)
4. **Rate Limiting**: Consider implementing rate limiting for webhook endpoints
5. **Error Handling**: Ensure proper error handling for failed message sends

## Troubleshooting

### Bot Not Responding

1. **Check bot token**: Verify `TELEGRAM_BOT_TOKEN` in `.env` is correct
2. **Check webhook**: Verify webhook is set correctly using `getWebhookInfo`
3. **Check server logs**: Look for errors in your backend server logs
4. **Check bot status**: Make sure your bot is not blocked or deactivated

### Webhook Not Receiving Messages

1. **Verify webhook URL**: Use `getWebhookInfo` to check if webhook URL is correct
2. **Check HTTPS**: Webhook URL must use HTTPS (not HTTP)
3. **Check firewall**: Ensure your server can receive POST requests on the webhook endpoint
4. **Check ngrok**: If using ngrok, ensure the tunnel is active

### Messages Not Sending

1. **Check chat ID**: Ensure the patient has started a conversation with the bot
2. **Check bot permissions**: The bot needs to be able to send messages
3. **Check server logs**: Look for API errors from Telegram
4. **Rate limits**: Telegram has rate limits; check if you're exceeding them

### Database Errors

1. **Run migrations**: Ensure database migrations are up to date
2. **Check schema**: Verify `telegramChatId` and `telegramUsername` columns exist
3. **Check data types**: `telegramChatId` should be `BIGINT` to handle large numbers

## Additional Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Bot API Tutorial](https://core.telegram.org/bots/tutorial)
- [Node.js Telegram Bot Examples](https://github.com/yagop/node-telegram-bot-api/tree/master/examples)

## Support

If you encounter issues:
1. Check the backend server logs
2. Verify all environment variables are set correctly
3. Test the webhook using the `getWebhookInfo` endpoint
4. Check Telegram's API status: [https://status.telegram.org](https://status.telegram.org)

