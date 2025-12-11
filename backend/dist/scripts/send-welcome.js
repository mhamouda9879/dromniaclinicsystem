#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const envPath = path.resolve(__dirname, '../.env');
const altEnvPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}
else if (fs.existsSync(altEnvPath)) {
    dotenv.config({ path: altEnvPath });
}
else {
    dotenv.config();
}
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
    process.exit(1);
}
const chatId = process.argv[2];
if (!chatId) {
    console.error('❌ Please provide a chat ID');
    console.log('Usage: npm run send:welcome <chatId>');
    console.log('Example: npm run send:welcome 1099690423');
    process.exit(1);
}
const welcomeMessage = `👋 *Welcome to Dr.Omnia Clinic!*

I am your virtual assistant. I can help you:

• Book appointments
• Check your queue status  
• Get information about our services

*To get started, please reply with:*

🔢 *MENU* - to see all options
or
▶️ *START* - to begin booking

You can also type a number from 1-10 to select a service directly!

*How can I help you today?* 😊`;
async function sendWelcomeMessage() {
    try {
        const response = await axios_1.default.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: welcomeMessage,
            parse_mode: 'Markdown',
        }, {
            timeout: 10000,
        });
        console.log(`✅ Welcome message sent successfully to chat ${chatId}`);
        console.log(`📱 Message ID: ${response.data.result.message_id}`);
        return true;
    }
    catch (error) {
        const errorDesc = error.response?.data?.description || error.message;
        if (error.response?.status === 400 && errorDesc.includes('chat not found')) {
            console.error(`❌ Chat not found. User with chat ID ${chatId} may not have started a conversation with the bot.`);
            console.log('   Ask the user to send /start to the bot first.');
        }
        else if (error.response?.status === 403) {
            console.error(`❌ Bot was blocked by user with chat ID ${chatId}`);
        }
        else {
            console.error(`❌ Failed to send message: ${errorDesc}`);
        }
        return false;
    }
}
sendWelcomeMessage().then((success) => {
    process.exit(success ? 0 : 1);
});
//# sourceMappingURL=send-welcome.js.map