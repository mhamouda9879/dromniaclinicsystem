#!/usr/bin/env ts-node
/**
 * Check Webhook Status
 * 
 * Usage: npm run check:webhook
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

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
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`,
      { timeout: 10000 }
    );

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
      } else {
        console.log(`\n✅ No errors - webhook is healthy`);
      }
      
      if (webhook.last_error_date && webhook.last_error_date < Date.now() / 1000 - 3600) {
        // Error older than 1 hour
        console.log(`\n✅ Last error was more than 1 hour ago - webhook appears stable`);
      }
    } else {
      console.log('❌ No webhook is currently set');
      console.log('\nTo set a webhook, run:');
      console.log('  npm run setup:webhook <your-production-url>');
    }
    
    console.log('═'.repeat(50));
  } catch (error: any) {
    console.error('❌ Error checking webhook:', error.message);
    process.exit(1);
  }
}

checkWebhook();

