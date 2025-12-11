# WhatsApp Business Cloud API Setup Guide

Complete step-by-step guide to set up WhatsApp Business Cloud API for the OB/GYN Clinic System.

## Prerequisites

1. **Meta Business Account**: You need a Facebook/Meta Business Account
2. **Phone Number**: A phone number that will be used for WhatsApp Business
3. **Domain**: A domain name with SSL certificate (for webhook URLs)
4. **Meta Developer Account**: Access to Meta for Developers platform

---

## Step 1: Create Meta Business Account

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click **"Create Account"** or sign in
3. Fill in your business information:
   - Business name: Your clinic name
   - Your name and email
   - Business phone number
4. Complete the account verification process

---

## Step 2: Create Meta App for WhatsApp

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **"My Apps"** → **"Create App"**
3. Select app type: **"Business"**
4. Fill in app details:
   - App Name: "OB/GYN Clinic WhatsApp System" (or your preference)
   - App Contact Email: Your email
   - Business Account: Select your business account
5. Click **"Create App"**

---

## Step 3: Add WhatsApp Product

1. In your app dashboard, go to **"Add Products"**
2. Find **"WhatsApp"** and click **"Set Up"**
3. You'll be taken to the WhatsApp Getting Started page

---

## Step 4: Get Your Phone Number ID and Access Token

### Option A: Using Meta Business Manager (Recommended for Production)

1. Go to [business.facebook.com](https://business.facebook.com)
2. Navigate to **"Business Settings"** → **"WhatsApp Accounts"**
3. Click **"Add"** to add a new WhatsApp Business Account
4. Follow the wizard to:
   - Add or select a phone number
   - Verify the phone number via SMS/call
5. Once added, you'll see:
   - **Phone Number ID**: Found in the account details
   - **Business Account ID**: Also in account details

### Option B: Using Test Number (For Development/Testing)

1. In your Meta App dashboard, go to **"WhatsApp"** → **"Getting Started"**
2. You'll see a temporary phone number (e.g., +1 415 XXX XXXX)
3. This is a test number that works for 72 hours (can be refreshed)
4. Click **"Show"** next to **"Temporary access token"** to see your token

**Important**: For production, you'll need to go through App Review to get a permanent number.

---

## Step 5: Get Permanent Access Token

1. In Meta App dashboard, go to **"WhatsApp"** → **"API Setup"**
2. Under **"Temporary access token"**, click **"Generate token"**
3. Copy the token immediately (it won't be shown again)

**For Production (System User Token)**:
1. Go to **"WhatsApp"** → **"API Setup"**
2. Scroll to **"Access tokens"** section
3. Create a **System User**:
   - Go to Business Settings → Users → System Users
   - Click **"Add"** → Enter name → Select role
   - Click **"Generate New Token"**
   - Select your app and WhatsApp permissions
   - Copy the token (this is permanent)

---

## Step 6: Get Phone Number ID

1. In WhatsApp dashboard, go to **"API Setup"**
2. Find **"Phone number ID"** section
3. Copy the Phone Number ID (it looks like: `123456789012345`)
4. Or get it from the API:
   ```bash
   curl -X GET "https://graph.facebook.com/v18.0/me/phone_numbers?access_token=YOUR_ACCESS_TOKEN"
   ```

---

## Step 7: Configure Webhook

### 7.1. Set Up Webhook URL

You need a publicly accessible URL where Meta can send incoming messages.

1. **If you have a domain with SSL**:
   - Webhook URL: `https://yourdomain.com/whatsapp/webhook`
   - Example: `https://clinic.example.com/whatsapp/webhook`

2. **For local development/testing**, use a tunneling service:
   - **ngrok** (recommended):
     ```bash
     # Install ngrok: https://ngrok.com/download
     ngrok http 3000
     # You'll get a URL like: https://abc123.ngrok.io
     # Use: https://abc123.ngrok.io/whatsapp/webhook
     ```
   
   - **localtunnel**:
     ```bash
     npm install -g localtunnel
     lt --port 3000
     # Use the provided URL + /whatsapp/webhook
     ```

### 7.2. Configure Webhook in Meta

1. In Meta App dashboard, go to **"WhatsApp"** → **"Configuration"**
2. Under **"Webhook"**, click **"Edit"**
3. Enter:
   - **Callback URL**: `https://yourdomain.com/whatsapp/webhook`
   - **Verify Token**: Create a random string (e.g., `my-secure-verify-token-12345`)
   - **Webhook Fields**: Select **"messages"**
4. Click **"Verify and Save"**

### 7.3. Verify Webhook (Backend handles this)

Your backend at `/whatsapp/webhook` should handle the verification:

```typescript
// GET /whatsapp/webhook
// Meta sends:
// ?hub.mode=subscribe
// &hub.challenge=CHALLENGE_STRING
// &hub.verify_token=YOUR_VERIFY_TOKEN

// Your backend should return the challenge if verify_token matches
```

---

## Step 8: Subscribe to Webhook Events

1. After webhook is verified, go back to **"Configuration"**
2. Find your phone number under **"Phone number"** section
3. Click **"Manage phone number"** → **"Add phone number"** (if needed)
4. Scroll to **"Webhook"** section
5. Click **"Manage"** → Select your webhook
6. Make sure **"messages"** is selected
7. Click **"Save"**

---

## Step 9: Configure Environment Variables

Update your backend `.env` file:

```env
# WhatsApp Business API Configuration
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=YOUR_PERMANENT_ACCESS_TOKEN
WHATSAPP_VERIFY_TOKEN=my-secure-verify-token-12345
```

**Replace**:
- `WHATSAPP_PHONE_NUMBER_ID`: Your phone number ID from Step 6
- `WHATSAPP_ACCESS_TOKEN`: Your access token from Step 5
- `WHATSAPP_VERIFY_TOKEN`: The verify token you set in Step 7.2

---

## Step 10: Test the Setup

### 10.1. Send a Test Message

1. Go to WhatsApp on your phone
2. Send a message to your WhatsApp Business number
3. Check your backend logs - you should see the webhook request

### 10.2. Test Webhook Verification

```bash
# Test webhook verification
curl -X GET "http://localhost:3000/whatsapp/webhook?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=YOUR_VERIFY_TOKEN"

# Should return: test123
```

### 10.3. Test Sending a Message

```bash
# Test sending a message via API
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "RECIPIENT_PHONE_NUMBER",
    "type": "text",
    "text": {
      "body": "Hello! This is a test message from the clinic."
    }
  }'
```

**Note**: Recipient phone number must be in international format without + (e.g., `14155551234`)

---

## Step 11: App Review (For Production)

To use WhatsApp Business API in production, you need:

1. **App Review Approval**:
   - Go to **"App Review"** → **"Permissions and Features"**
   - Request **"whatsapp_business_messaging"** permission
   - Fill out the use case form explaining your clinic management system
   - Submit for review (usually takes 1-7 days)

2. **Business Verification**:
   - Your Meta Business Account must be verified
   - Go to Business Settings → Security → Business Verification
   - Submit business documents

3. **Phone Number Verification**:
   - After approval, you can add a permanent phone number
   - Verify via SMS or phone call

---

## Step 12: Update Backend Configuration

Make sure your backend `whatsapp.controller.ts` handles webhooks correctly:

```typescript
@Controller('whatsapp')
export class WhatsAppController {
  // GET endpoint for webhook verification
  @Get('webhook')
  verifyWebhook(@Query() query: any) {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];
    
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return challenge; // Return challenge for verification
    }
    throw new ForbiddenException('Verification failed');
  }
  
  // POST endpoint for receiving messages
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    // Process incoming messages
  }
}
```

---

## Troubleshooting

### Issue: Webhook verification fails
- **Solution**: Check that verify token matches exactly (case-sensitive)
- **Solution**: Ensure your webhook URL is publicly accessible with SSL
- **Solution**: Check backend logs for errors

### Issue: Messages not received
- **Solution**: Verify webhook is subscribed to "messages" events
- **Solution**: Check phone number is active in Meta Business Manager
- **Solution**: Ensure access token has `whatsapp_business_messaging` permission

### Issue: Can't send messages
- **Solution**: Verify access token is valid and not expired
- **Solution**: Check phone number ID is correct
- **Solution**: For production, ensure app review is approved
- **Solution**: Check recipient number is in correct format

### Issue: 24-hour messaging window
- **WhatsApp Business API** has a 24-hour messaging window:
  - You can send template messages anytime
  - You can send free-form messages only within 24 hours of user's last message
  - After 24 hours, you must use approved message templates

---

## Important Notes

1. **Message Templates**: For messages outside the 24-hour window, you need to create and get approved message templates in Meta Business Manager

2. **Rate Limits**: WhatsApp has rate limits:
   - 1,000 conversations per 24 hours (free tier)
   - Higher limits available for verified businesses

3. **Costs**: WhatsApp Business API pricing:
   - First 1,000 conversations/month: Free
   - After that: Varies by country (check Meta's pricing page)

4. **Testing**: Use test numbers for development, but they expire after 72 hours

5. **Security**: Never commit access tokens or verify tokens to version control!

---

## Quick Reference

- **Meta Developers**: https://developers.facebook.com
- **WhatsApp Business API Docs**: https://developers.facebook.com/docs/whatsapp
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
- **Webhook Debugging**: Check Meta App Dashboard → Tools → Webhooks

---

## Next Steps After Setup

1. Test sending and receiving messages
2. Create message templates for automated notifications
3. Set up message templates for:
   - Booking confirmations
   - Appointment reminders
   - Queue updates
4. Monitor usage and rate limits in Meta Business Manager

