# Telegram Integration Migration

## Summary

The OB/GYN Clinic System has been migrated from WhatsApp Business Cloud API to Telegram Bot API. All functionality remains the same, but the messaging platform has changed.

## What Changed

### Backend Changes

1. **New Telegram Module** (`backend/src/modules/telegram/`)
   - `telegram.service.ts`: Handles sending messages via Telegram Bot API
   - `telegram.controller.ts`: Webhook endpoint for receiving messages
   - `conversation.service.ts`: Conversation flow logic (same as WhatsApp, adapted for Telegram)
   - `telegram.module.ts`: Module configuration

2. **Updated Services**
   - `notifications.service.ts`: Now uses `TelegramService` instead of `WhatsAppService`
   - `patients.service.ts`: Added `findByTelegramChatId()` method

3. **Updated Entities**
   - `patient.entity.ts`: Added `telegramChatId` and `telegramUsername` fields
   - `notification-log.entity.ts`: Added `TELEGRAM` to `NotificationChannel` enum
   - `appointment.entity.ts`: Added `TELEGRAM` to `AppointmentSource` enum

4. **Updated DTOs**
   - `create-patient.dto.ts`: Added `telegramChatId` and `telegramUsername` fields

5. **Module Updates**
   - `app.module.ts`: Imports `TelegramModule` instead of `WhatsAppModule`
   - `notifications.module.ts`: Uses `TelegramModule` instead of `WhatsAppModule`

### Removed/Deprecated

- WhatsApp module files still exist but are no longer used by the system
- WhatsApp-related environment variables are no longer needed

## Environment Variables

**Required:**
```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
```

**Optional:**
```env
TELEGRAM_WEBHOOK_URL=https://your-domain.com/telegram/webhook
```

## Database Migration

You need to run a migration to add Telegram fields to the database:

```sql
ALTER TABLE patients 
ADD COLUMN "telegramChatId" BIGINT UNIQUE,
ADD COLUMN "telegramUsername" VARCHAR(100);
```

Or use TypeORM migrations:

```bash
cd backend
npm run migration:generate -- -n AddTelegramFields
npm run migration:run
```

Also update the `NotificationChannel` enum and `AppointmentSource` enum if needed.

## Setup Steps

1. **Create a Telegram Bot** (see `docs/TELEGRAM_SETUP_GUIDE.md`)
2. **Set environment variables** in `backend/.env`
3. **Run database migrations**
4. **Set webhook** (for production or local testing with ngrok)
5. **Test the bot** by starting a conversation on Telegram

## Key Differences: Telegram vs WhatsApp

### Advantages of Telegram

- ✅ **Easier Setup**: No business verification required
- ✅ **Better for Development**: Easier to test locally
- ✅ **More Flexible**: Better API, more features
- ✅ **Free**: No per-message costs (for reasonable usage)
- ✅ **Rich Formatting**: Better support for Markdown formatting

### Limitations

- ⚠️ **User Adoption**: Patients need Telegram installed (but it's very popular)
- ⚠️ **No Phone Verification**: Unlike WhatsApp, Telegram doesn't verify phone numbers
- ⚠️ **Chat ID Management**: Need to store and manage Telegram chat IDs

## Functionality Preserved

All features work exactly the same:

- ✅ Appointment booking via bot conversation
- ✅ Queue status checking
- ✅ Automated reminders (24h, 1h, 30min)
- ✅ Queue position updates
- ✅ Emergency triage
- ✅ All visit types supported
- ✅ Patient profile creation/updates

## Testing

1. Start the backend server:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Set up webhook (for local dev, use ngrok):
   ```bash
   ngrok http 3000
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -d '{"url": "https://your-ngrok-url.ngrok.io/telegram/webhook"}'
   ```

3. Find your bot on Telegram and start a conversation
4. Test the menu and booking flow

## Troubleshooting

See `docs/TELEGRAM_SETUP_GUIDE.md` for detailed troubleshooting steps.

## Support

If you encounter issues:
- Check backend logs
- Verify bot token is correct
- Check webhook configuration using `/telegram/webhook-info` endpoint
- Ensure database migrations are complete

