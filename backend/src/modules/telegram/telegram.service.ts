import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ConversationService } from './conversation.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly apiUrl: string;
  private botInfo: any = null;

  constructor(
    private configService: ConfigService,
    private conversationService: ConversationService,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    
    if (!this.botToken) {
      this.logger.warn('⚠️  TELEGRAM_BOT_TOKEN is not set in environment variables!');
      this.logger.warn('Telegram features will not work until a valid token is provided.');
    } else if (!this.isValidTokenFormat(this.botToken)) {
      this.logger.warn('⚠️  TELEGRAM_BOT_TOKEN format appears to be invalid!');
      this.logger.warn('Expected format: <number>:<alphanumeric_string>');
    } else {
      this.logger.log('✅ Telegram Bot Token found in configuration');
    }
    
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async onModuleInit() {
    if (this.botToken) {
      try {
        await this.validateToken();
        this.logger.log('✅ Telegram Bot is connected and ready!');
      } catch (error) {
        this.logger.error('❌ Failed to validate Telegram Bot Token:', error.message);
        this.logger.error('Please check your TELEGRAM_BOT_TOKEN in .env file');
      }
    }
  }

  private isValidTokenFormat(token: string): boolean {
    // Telegram bot tokens are in format: <number>:<alphanumeric_string>
    return /^\d+:[A-Za-z0-9_-]+$/.test(token);
  }

  private async validateToken(): Promise<void> {
    try {
      const response = await axios.get(`https://api.telegram.org/bot${this.botToken}/getMe`);
      this.botInfo = response.data.result;
      this.logger.log(`Bot validated: @${this.botInfo.username} (${this.botInfo.first_name})`);
      return Promise.resolve();
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Invalid bot token - Unauthorized');
      } else if (error.response?.status === 404) {
        throw new Error('Bot not found');
      } else {
        throw new Error(`Token validation failed: ${error.message}`);
      }
    }
  }

  async sendMessage(chatId: string | number, message: string): Promise<void> {
    if (!this.botToken) {
      throw new Error('Telegram Bot Token is not configured. Please set TELEGRAM_BOT_TOKEN in .env');
    }

    try {
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }, {
        timeout: 10000, // 10 second timeout
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.description || error.message;
      this.logger.error(`Error sending Telegram message to ${chatId}:`, errorMessage);
      
      // Handle specific Telegram API errors
      if (error.response?.status === 400) {
        if (error.response.data?.description?.includes('chat not found')) {
          throw new Error('Chat not found - user may not have started a conversation with the bot');
        }
        if (error.response.data?.description?.includes('bot was blocked')) {
          throw new Error('Bot was blocked by the user');
        }
      } else if (error.response?.status === 403) {
        throw new Error('Bot was blocked by the user');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded - too many requests');
      }
      
      throw new Error(`Failed to send message: ${errorMessage}`);
    }
  }

  async sendMessageWithKeyboard(
    chatId: string | number,
    message: string,
    keyboard: any[][],
  ): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: keyboard,
          resize_keyboard: true,
          one_time_keyboard: false,
        },
      });
    } catch (error: any) {
      console.error('Error sending Telegram message with keyboard:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendPhoto(chatId: string | number, photo: string, caption?: string): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/sendPhoto`, {
        chat_id: chatId,
        photo: photo,
        caption: caption,
        parse_mode: 'Markdown',
      });
    } catch (error: any) {
      console.error('Error sending Telegram photo:', error.response?.data || error.message);
      throw error;
    }
  }

  async handleIncomingMessage(chatId: number, message: string, username?: string): Promise<void> {
    // Process incoming message through conversation flow
    // Convert chatId to string for consistency with phone number format
    const response = await this.conversationService.processMessage(
      chatId.toString(),
      message,
      username,
    );
    
    if (response) {
      await this.sendMessage(chatId, response);
    }
  }

  async setWebhook(url: string): Promise<void> {
    if (!this.botToken) {
      throw new Error('Telegram Bot Token is not configured');
    }

    // Validate URL format
    if (!url.startsWith('https://')) {
      throw new Error('Webhook URL must use HTTPS');
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/setWebhook`,
        {
          url: url,
          drop_pending_updates: true, // Drop pending updates when setting new webhook
        },
        {
          timeout: 10000,
        },
      );
      
      if (response.data.ok) {
        this.logger.log(`Webhook set successfully: ${url}`);
      } else {
        throw new Error(response.data.description || 'Failed to set webhook');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.description || error.message;
      this.logger.error('Error setting Telegram webhook:', errorMessage);
      throw new Error(`Failed to set webhook: ${errorMessage}`);
    }
  }

  async deleteWebhook(): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/deleteWebhook`);
    } catch (error: any) {
      console.error('Error deleting Telegram webhook:', error.response?.data || error.message);
      throw error;
    }
  }

  async getWebhookInfo(): Promise<any> {
    if (!this.botToken) {
      throw new Error('Telegram Bot Token is not configured');
    }

    try {
      const response = await axios.get(`${this.apiUrl}/getWebhookInfo`, {
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      this.logger.error('Error getting webhook info:', error.response?.data || error.message);
      throw error;
    }
  }

  async getBotInfo(): Promise<any> {
    if (!this.botToken) {
      throw new Error('Telegram Bot Token is not configured');
    }

    try {
      const response = await axios.get(`${this.apiUrl}/getMe`, {
        timeout: 10000,
      });
      return response.data;
    } catch (error: any) {
      this.logger.error('Error getting bot info:', error.response?.data || error.message);
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; botInfo?: any }> {
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
    } catch (error: any) {
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

  isConfigured(): boolean {
    return !!this.botToken && this.isValidTokenFormat(this.botToken);
  }

  extractChatId(telegramUpdate: any): number | null {
    return telegramUpdate?.message?.chat?.id || 
           telegramUpdate?.callback_query?.message?.chat?.id || 
           null;
  }

  extractMessageText(telegramUpdate: any): string {
    return telegramUpdate?.message?.text || 
           telegramUpdate?.callback_query?.data || 
           '';
  }

  extractUsername(telegramUpdate: any): string | undefined {
    return telegramUpdate?.message?.from?.username || 
           telegramUpdate?.callback_query?.from?.username;
  }

  extractFirstName(telegramUpdate: any): string | undefined {
    return telegramUpdate?.message?.from?.first_name || 
           telegramUpdate?.callback_query?.from?.first_name;
  }
}

