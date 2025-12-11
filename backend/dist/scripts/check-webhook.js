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
if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set');
    process.exit(1);
}
async function checkWebhook() {
    try {
        const response = await axios_1.default.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`, { timeout: 10000 });
        const webhook = response.data.result;
        console.log('📊 Telegram Webhook Status\n');
        console.log('═'.repeat(50));
        if (webhook.url) {
            console.log(`✅ Webhook URL: ${webhook.url}`);
            console.log(`📊 Pending Updates: ${webhook.pending_update_count || 0}`);
            console.log(`🔢 Max Connections: ${webhook.max_connections || 'Default'}`);
            if (webhook.last_error_date) {
                console.log(`\n⚠️  Last Error:`);
                console.log(`   Date: ${new Date(webhook.last_error_date * 1000).toISOString()}`);
                console.log(`   Message: ${webhook.last_error_message}`);
            }
            else {
                console.log(`\n✅ No errors - webhook is healthy`);
            }
            if (webhook.last_error_date && webhook.last_error_date < Date.now() / 1000 - 3600) {
                console.log(`\n✅ Last error was more than 1 hour ago - webhook appears stable`);
            }
        }
        else {
            console.log('❌ No webhook is currently set');
            console.log('\nTo set a webhook, run:');
            console.log('  npm run setup:webhook <your-production-url>');
        }
        console.log('═'.repeat(50));
    }
    catch (error) {
        console.error('❌ Error checking webhook:', error.message);
        process.exit(1);
    }
}
checkWebhook();
//# sourceMappingURL=check-webhook.js.map