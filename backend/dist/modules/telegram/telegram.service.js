"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const conversation_service_1 = require("./conversation.service");
let TelegramService = TelegramService_1 = class TelegramService {
    constructor(configService, conversationService) {
        this.configService = configService;
        this.conversationService = conversationService;
        this.logger = new common_1.Logger(TelegramService_1.name);
        this.botInfo = null;
        this.botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
        if (!this.botToken) {
            this.logger.warn('⚠️  TELEGRAM_BOT_TOKEN is not set in environment variables!');
            this.logger.warn('Telegram features will not work until a valid token is provided.');
        }
        else if (!this.isValidTokenFormat(this.botToken)) {
            this.logger.warn('⚠️  TELEGRAM_BOT_TOKEN format appears to be invalid!');
            this.logger.warn('Expected format: <number>:<alphanumeric_string>');
        }
        else {
            this.logger.log('✅ Telegram Bot Token found in configuration');
        }
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }
    async onModuleInit() {
        if (this.botToken) {
            try {
                await this.validateToken();
                this.logger.log('✅ Telegram Bot is connected and ready!');
            }
            catch (error) {
                this.logger.error('❌ Failed to validate Telegram Bot Token:', error.message);
                this.logger.error('Please check your TELEGRAM_BOT_TOKEN in .env file');
            }
        }
    }
    isValidTokenFormat(token) {
        return /^\d+:[A-Za-z0-9_-]+$/.test(token);
    }
    async validateToken() {
        try {
            const response = await axios_1.default.get(`https://api.telegram.org/bot${this.botToken}/getMe`);
            this.botInfo = response.data.result;
            this.logger.log(`Bot validated: @${this.botInfo.username} (${this.botInfo.first_name})`);
            return Promise.resolve();
        }
        catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Invalid bot token - Unauthorized');
            }
            else if (error.response?.status === 404) {
                throw new Error('Bot not found');
            }
            else {
                throw new Error(`Token validation failed: ${error.message}`);
            }
        }
    }
    async sendMessage(chatId, message) {
        if (!this.botToken) {
            throw new Error('Telegram Bot Token is not configured. Please set TELEGRAM_BOT_TOKEN in .env');
        }
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/sendMessage`, {
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
            }, {
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            const errorMessage = error.response?.data?.description || error.message;
            this.logger.error(`Error sending Telegram message to ${chatId}:`, errorMessage);
            if (error.response?.status === 400) {
                if (error.response.data?.description?.includes('chat not found')) {
                    throw new Error('Chat not found - user may not have started a conversation with the bot');
                }
                if (error.response.data?.description?.includes('bot was blocked')) {
                    throw new Error('Bot was blocked by the user');
                }
            }
            else if (error.response?.status === 403) {
                throw new Error('Bot was blocked by the user');
            }
            else if (error.response?.status === 429) {
                throw new Error('Rate limit exceeded - too many requests');
            }
            throw new Error(`Failed to send message: ${errorMessage}`);
        }
    }
    async sendMessageWithKeyboard(chatId, message, keyboard) {
        try {
            await axios_1.default.post(`${this.apiUrl}/sendMessage`, {
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: keyboard,
                    resize_keyboard: true,
                    one_time_keyboard: false,
                },
            });
        }
        catch (error) {
            console.error('Error sending Telegram message with keyboard:', error.response?.data || error.message);
            throw error;
        }
    }
    async sendPhoto(chatId, photo, caption) {
        try {
            await axios_1.default.post(`${this.apiUrl}/sendPhoto`, {
                chat_id: chatId,
                photo: photo,
                caption: caption,
                parse_mode: 'Markdown',
            });
        }
        catch (error) {
            console.error('Error sending Telegram photo:', error.response?.data || error.message);
            throw error;
        }
    }
    async handleIncomingMessage(chatId, message, username) {
        const response = await this.conversationService.processMessage(chatId.toString(), message, username);
        if (response) {
            await this.sendMessage(chatId, response);
        }
    }
    async setWebhook(url) {
        if (!this.botToken) {
            throw new Error('Telegram Bot Token is not configured');
        }
        if (!url.startsWith('https://')) {
            throw new Error('Webhook URL must use HTTPS');
        }
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/setWebhook`, {
                url: url,
                drop_pending_updates: true,
            }, {
                timeout: 10000,
            });
            if (response.data.ok) {
                this.logger.log(`Webhook set successfully: ${url}`);
            }
            else {
                throw new Error(response.data.description || 'Failed to set webhook');
            }
        }
        catch (error) {
            const errorMessage = error.response?.data?.description || error.message;
            this.logger.error('Error setting Telegram webhook:', errorMessage);
            throw new Error(`Failed to set webhook: ${errorMessage}`);
        }
    }
    async deleteWebhook() {
        try {
            await axios_1.default.post(`${this.apiUrl}/deleteWebhook`);
        }
        catch (error) {
            console.error('Error deleting Telegram webhook:', error.response?.data || error.message);
            throw error;
        }
    }
    async getWebhookInfo() {
        if (!this.botToken) {
            throw new Error('Telegram Bot Token is not configured');
        }
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/getWebhookInfo`, {
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Error getting webhook info:', error.response?.data || error.message);
            throw error;
        }
    }
    async getBotInfo() {
        if (!this.botToken) {
            throw new Error('Telegram Bot Token is not configured');
        }
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/getMe`, {
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            this.logger.error('Error getting bot info:', error.response?.data || error.message);
            throw error;
        }
    }
    async testConnection() {
        if (!this.botToken) {
            return {
                success: false,
                message: 'TELEGRAM_BOT_TOKEN is not set in environment variables',
            };
        }
        if (!this.isValidTokenFormat(this.botToken)) {
            return {
                success: false,
                message: 'TELEGRAM_BOT_TOKEN format is invalid. Expected format: <number>:<alphanumeric_string>',
            };
        }
        try {
            const botInfo = await this.getBotInfo();
            return {
                success: true,
                message: `Successfully connected to Telegram Bot: @${botInfo.result.username}`,
                botInfo: botInfo.result,
            };
        }
        catch (error) {
            if (error.response?.status === 401) {
                return {
                    success: false,
                    message: 'Invalid bot token - Unauthorized. Please check your TELEGRAM_BOT_TOKEN',
                };
            }
            return {
                success: false,
                message: `Connection failed: ${error.message}`,
            };
        }
    }
    isConfigured() {
        return !!this.botToken && this.isValidTokenFormat(this.botToken);
    }
    extractChatId(telegramUpdate) {
        return telegramUpdate?.message?.chat?.id ||
            telegramUpdate?.callback_query?.message?.chat?.id ||
            null;
    }
    extractMessageText(telegramUpdate) {
        return telegramUpdate?.message?.text ||
            telegramUpdate?.callback_query?.data ||
            '';
    }
    extractUsername(telegramUpdate) {
        return telegramUpdate?.message?.from?.username ||
            telegramUpdate?.callback_query?.from?.username;
    }
    extractFirstName(telegramUpdate) {
        return telegramUpdate?.message?.from?.first_name ||
            telegramUpdate?.callback_query?.from?.first_name;
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        conversation_service_1.ConversationService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map