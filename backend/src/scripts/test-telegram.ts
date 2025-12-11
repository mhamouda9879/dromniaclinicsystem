#!/usr/bin/env ts-node
/**
 * Telegram Bot Test Script
 * 
 * This script tests the Telegram bot configuration and connectivity.
 * Run with: npm run test:telegram
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : null;

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  data?: any;
}

async function testTokenFormat(): Promise<TestResult> {
  if (!BOT_TOKEN) {
    return {
      name: 'Token Exists',
      success: false,
      message: '❌ TELEGRAM_BOT_TOKEN is not set in .env file',
    };
  }

  // Telegram bot tokens format: <number>:<alphanumeric_string>
  const isValidFormat = /^\d+:[A-Za-z0-9_-]+$/.test(BOT_TOKEN);
  
  if (!isValidFormat) {
    return {
      name: 'Token Format',
      success: false,
      message: `❌ Invalid token format. Expected: <number>:<alphanumeric_string>\n   Got: ${BOT_TOKEN.substring(0, 10)}...`,
    };
  }

  return {
    name: 'Token Format',
    success: true,
    message: '✅ Token format is valid',
  };
}

async function testBotConnection(): Promise<TestResult> {
  if (!API_BASE) {
    return {
      name: 'Bot Connection',
      success: false,
      message: '❌ Cannot test connection - token not set',
    };
  }

  try {
    const response = await axios.get(`${API_BASE}/getMe`, {
      timeout: 10000,
    });

    const bot = response.data.result;
    return {
      name: 'Bot Connection',
      success: true,
      message: `✅ Successfully connected to bot: @${bot.username} (${bot.first_name})`,
      data: bot,
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      return {
        name: 'Bot Connection',
        success: false,
        message: '❌ Invalid bot token - Unauthorized. Please check your TELEGRAM_BOT_TOKEN',
      };
    }
    return {
      name: 'Bot Connection',
      success: false,
      message: `❌ Connection failed: ${error.message}`,
    };
  }
}

async function testWebhookInfo(): Promise<TestResult> {
  if (!API_BASE) {
    return {
      name: 'Webhook Info',
      success: false,
      message: '❌ Cannot check webhook - token not set',
    };
  }

  try {
    const response = await axios.get(`${API_BASE}/getWebhookInfo`, {
      timeout: 10000,
    });

    const webhook = response.data.result;
    
    if (!webhook.url) {
      return {
        name: 'Webhook Info',
        success: false,
        message: '⚠️  No webhook is currently set. You need to set a webhook for production use.',
      };
    }

    return {
      name: 'Webhook Info',
      success: true,
      message: `✅ Webhook is configured: ${webhook.url}\n   Pending updates: ${webhook.pending_update_count || 0}`,
      data: webhook,
    };
  } catch (error: any) {
    return {
      name: 'Webhook Info',
      success: false,
      message: `❌ Failed to get webhook info: ${error.message}`,
    };
  }
}

async function testSendMessage(chatId?: string): Promise<TestResult> {
  if (!API_BASE) {
    return {
      name: 'Send Message',
      success: false,
      message: '❌ Cannot test sending - token not set',
    };
  }

  if (!chatId) {
    return {
      name: 'Send Message',
      success: true,
      message: '⏭️  Skipped - no chat ID provided. Use: npm run test:telegram -- <chatId>',
    };
  }

  try {
    const response = await axios.post(
      `${API_BASE}/sendMessage`,
      {
        chat_id: chatId,
        text: '🧪 *Test Message*\n\nThis is a test message from the OB/GYN Clinic Bot. If you received this, the bot is working correctly! ✅',
        parse_mode: 'Markdown',
      },
      {
        timeout: 10000,
      },
    );

    return {
      name: 'Send Message',
      success: true,
      message: `✅ Test message sent successfully to chat ${chatId}`,
      data: response.data.result,
    };
  } catch (error: any) {
    const errorDesc = error.response?.data?.description || error.message;
    
    if (error.response?.status === 400 && errorDesc.includes('chat not found')) {
      return {
        name: 'Send Message',
        success: false,
        message: `❌ Chat not found. The user with chat ID ${chatId} may not have started a conversation with the bot.\n   To get your chat ID, start a conversation with the bot and check the webhook logs.`,
      };
    }

    if (error.response?.status === 403) {
      return {
        name: 'Send Message',
        success: false,
        message: `❌ Bot was blocked by user with chat ID ${chatId}`,
      };
    }

    return {
      name: 'Send Message',
      success: false,
      message: `❌ Failed to send message: ${errorDesc}`,
    };
  }
}

async function runAllTests(chatId?: string) {
  console.log('🔍 Testing Telegram Bot Configuration...\n');
  console.log('=' .repeat(60));

  const tests = [
    await testTokenFormat(),
    await testBotConnection(),
    await testWebhookInfo(),
    await testSendMessage(chatId),
  ];

  console.log('\n📊 Test Results:\n');
  tests.forEach((test) => {
    console.log(`${test.message}\n`);
    if (test.data && test.name === 'Bot Connection') {
      console.log(`   Bot ID: ${test.data.id}`);
      console.log(`   Username: @${test.data.username}`);
      console.log(`   First Name: ${test.data.first_name}`);
      console.log(`   Can Join Groups: ${test.data.can_join_groups}`);
      console.log(`   Can Read All Group Messages: ${test.data.can_read_all_group_messages}`);
      console.log(`   Supports Inline Queries: ${test.data.supports_inline_queries}\n`);
    }
  });

  const allPassed = tests.every((t) => t.success || t.message.includes('Skipped'));
  const criticalFailed = tests.slice(0, 2).some((t) => !t.success);

  console.log('=' .repeat(60));
  
  if (criticalFailed) {
    console.log('\n❌ Critical tests failed. Please fix the issues above.\n');
    process.exit(1);
  } else if (allPassed) {
    console.log('\n✅ All tests passed! Your Telegram bot is configured correctly.\n');
    console.log('📝 Next Steps:');
    console.log('   1. Set up webhook (for production): POST /telegram/set-webhook');
    console.log('   2. Test sending messages: POST /telegram/test-message');
    console.log('   3. Start a conversation with your bot on Telegram');
    console.log('   4. Test the booking flow through Telegram\n');
  } else {
    console.log('\n⚠️  Some non-critical tests failed. Review the results above.\n');
  }
}

// Get chat ID from command line arguments if provided
const chatId = process.argv[2];

runAllTests(chatId).catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});

