import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any) {
    try {
      // Telegram sends updates in this format
      const update = body;

      // Handle different update types
      if (update.message) {
        const chatId = this.telegramService.extractChatId(update);
        const messageText = this.telegramService.extractMessageText(update);
        const username = this.telegramService.extractUsername(update);

        if (chatId && messageText) {
          // Process the message asynchronously (don't wait for response)
          this.telegramService
            .handleIncomingMessage(chatId, messageText, username)
            .catch((error) => {
              console.error('Error processing Telegram message:', error);
            });
        }
      } else if (update.callback_query) {
        // Handle inline keyboard button clicks
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

        // Answer the callback query to remove loading state
        // This is done asynchronously, don't wait
      }

      return { ok: true };
    } catch (error) {
      console.error('Error handling Telegram webhook:', error);
      return { ok: false, error: error.message };
    }
  }

  @Get('webhook-info')
  async getWebhookInfo() {
    return await this.telegramService.getWebhookInfo();
  }

  @Post('set-webhook')
  async setWebhook(@Body() body: { url: string }) {
    try {
      await this.telegramService.setWebhook(body.url);
      return { success: true, message: 'Webhook set successfully' };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to set webhook',
      };
    }
  }

  @Get('test')
  async testConnection() {
    return await this.telegramService.testConnection();
  }

  @Get('bot-info')
  async getBotInfo() {
    try {
      const botInfo = await this.telegramService.getBotInfo();
      return { success: true, data: botInfo };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get bot info',
      };
    }
  }

  @Get('health')
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

  @Post('test-message')
  async testMessage(@Body() body: { chatId: string | number; message?: string }) {
    try {
      const testMessage = body.message || '🧪 *Test Message*\n\nThis is a test message from the OB/GYN Clinic Bot. If you received this, the bot is working correctly! ✅';
      await this.telegramService.sendMessage(body.chatId, testMessage);
      return {
        success: true,
        message: 'Test message sent successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send test message',
      };
    }
  }
}

