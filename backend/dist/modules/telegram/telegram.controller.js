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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramController = void 0;
const common_1 = require("@nestjs/common");
const telegram_service_1 = require("./telegram.service");
let TelegramController = class TelegramController {
    constructor(telegramService) {
        this.telegramService = telegramService;
    }
    async handleWebhook(body) {
        try {
            const update = body;
            if (update.message) {
                const chatId = this.telegramService.extractChatId(update);
                const messageText = this.telegramService.extractMessageText(update);
                const username = this.telegramService.extractUsername(update);
                if (chatId && messageText) {
                    this.telegramService
                        .handleIncomingMessage(chatId, messageText, username)
                        .catch((error) => {
                        console.error('Error processing Telegram message:', error);
                    });
                }
            }
            else if (update.callback_query) {
                const chatId = this.telegramService.extractChatId(update);
                const callbackData = update.callback_query.data;
                const username = this.telegramService.extractUsername(update);
                if (chatId && callbackData) {
                    this.telegramService
                        .handleIncomingMessage(chatId, callbackData, username)
                        .catch((error) => {
                        console.error('Error processing Telegram callback:', error);
                    });
                }
            }
            return { ok: true };
        }
        catch (error) {
            console.error('Error handling Telegram webhook:', error);
            return { ok: false, error: error.message };
        }
    }
    async getWebhookInfo() {
        return await this.telegramService.getWebhookInfo();
    }
    async setWebhook(body) {
        try {
            await this.telegramService.setWebhook(body.url);
            return { success: true, message: 'Webhook set successfully' };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to set webhook',
            };
        }
    }
    async testConnection() {
        return await this.telegramService.testConnection();
    }
    async getBotInfo() {
        try {
            const botInfo = await this.telegramService.getBotInfo();
            return { success: true, data: botInfo };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to get bot info',
            };
        }
    }
    async healthCheck() {
        const isConfigured = this.telegramService.isConfigured();
        const testResult = isConfigured ? await this.telegramService.testConnection() : null;
        const webhookInfo = isConfigured ? await this.telegramService.getWebhookInfo().catch(() => null) : null;
        return {
            configured: isConfigured,
            connection: testResult,
            webhook: webhookInfo?.result || null,
        };
    }
    async testMessage(body) {
        try {
            const testMessage = body.message || '🧪 *Test Message*\n\nThis is a test message from the OB/GYN Clinic Bot. If you received this, the bot is working correctly! ✅';
            await this.telegramService.sendMessage(body.chatId, testMessage);
            return {
                success: true,
                message: 'Test message sent successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send test message',
            };
        }
    }
};
exports.TelegramController = TelegramController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('webhook-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "getWebhookInfo", null);
__decorate([
    (0, common_1.Post)('set-webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "setWebhook", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Get)('bot-info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "getBotInfo", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('test-message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "testMessage", null);
exports.TelegramController = TelegramController = __decorate([
    (0, common_1.Controller)('telegram'),
    __metadata("design:paramtypes", [telegram_service_1.TelegramService])
], TelegramController);
//# sourceMappingURL=telegram.controller.js.map