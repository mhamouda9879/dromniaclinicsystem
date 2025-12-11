#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PROD_URL = process.argv[2];
if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
    process.exit(1);
}
if (!PROD_URL) {
    console.error('❌ Please provide production URL');
    console.log('\nUsage: npm run setup:webhook <production-url>');
    console.log('Example: npm run setup:webhook https://your-domain.com');
    process.exit(1);
}
const webhookUrl = PROD_URL.startsWith('https://')
    ? `${PROD_URL}/telegram/webhook`
    : `https://${PROD_URL}/telegram/webhook`;
async function setupWebhook() {
    console.log('🔧 Setting up Telegram webhook for production...\n');
    console.log(`📡 Webhook URL: ${webhookUrl}\n`);
    try {
        console.log('1️⃣ Checking current webhook status...');
        const currentInfo = await axios_1.default.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`, { timeout: 10000 });
        if (currentInfo.data.result.url) {
            console.log(`   Current webhook: ${currentInfo.data.result.url}`);
            if (currentInfo.data.result.url === webhookUrl) {
                console.log('   ✅ Webhook is already set to this URL!');
            }
        }
        else {
            console.log('   ℹ️  No webhook currently set');
        }
        console.log('\n2️⃣ Testing webhook URL accessibility...');
        try {
            const testResponse = await axios_1.default.get(webhookUrl.replace('/telegram/webhook', '/telegram/health'), {
                timeout: 10000,
                validateStatus: () => true,
            });
            if (testResponse.status === 200 || testResponse.status === 404) {
                console.log('   ✅ Server is accessible');
            }
            else {
                console.log(`   ⚠️  Server returned status: ${testResponse.status}`);
            }
        }
        catch (error) {
            console.log(`   ⚠️  Could not reach server: ${error.message}`);
            console.log('   Make sure your server is running and accessible via HTTPS');
        }
        console.log('\n3️⃣ Setting webhook...');
        const response = await axios_1.default.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
            url: webhookUrl,
            drop_pending_updates: true,
        }, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.data.ok) {
            console.log('   ✅ Webhook set successfully!');
        }
        else {
            console.error('   ❌ Failed to set webhook:', response.data.description);
            process.exit(1);
        }
        console.log('\n4️⃣ Verifying webhook...');
        const verifyResponse = await axios_1.default.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`, { timeout: 10000 });
        const webhook = verifyResponse.data.result;
        if (webhook.url === webhookUrl) {
            console.log('   ✅ Webhook verified successfully!');
            console.log(`   📍 URL: ${webhook.url}`);
            console.log(`   📊 Pending updates: ${webhook.pending_update_count || 0}`);
            if (webhook.last_error_date) {
                console.log(`   ⚠️  Last error: ${webhook.last_error_message}`);
                console.log(`   ⚠️  Error date: ${new Date(webhook.last_error_date * 1000).toISOString()}`);
            }
            else {
                console.log('   ✅ No errors');
            }
        }
        else {
            console.error('   ❌ Webhook verification failed!');
            console.error(`   Expected: ${webhookUrl}`);
            console.error(`   Got: ${webhook.url}`);
            process.exit(1);
        }
        console.log('\n✅ Production webhook setup complete!');
        console.log('\n📝 Next steps:');
        console.log('   1. Test by sending a message to your bot on Telegram');
        console.log('   2. Check server logs to verify messages are received');
        console.log('   3. Monitor webhook status: npm run check:webhook');
    }
    catch (error) {
        console.error('\n❌ Error setting up webhook:');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Message: ${error.response.data?.description || error.message}`);
        }
        else if (error.request) {
            console.error('   No response received. Check your internet connection.');
        }
        else {
            console.error(`   ${error.message}`);
        }
        process.exit(1);
    }
}
setupWebhook();
//# sourceMappingURL=setup-webhook-production.js.map