import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConversationService } from './conversation.service';
export declare class TelegramService implements OnModuleInit {
    private configService;
    private conversationService;
    private readonly logger;
    private readonly botToken;
    private readonly apiUrl;
    private botInfo;
    constructor(configService: ConfigService, conversationService: ConversationService);
    onModuleInit(): Promise<void>;
    private isValidTokenFormat;
    private validateToken;
    sendMessage(chatId: string | number, message: string): Promise<void>;
    sendMessageWithKeyboard(chatId: string | number, message: string, keyboard: any[][]): Promise<void>;
    sendPhoto(chatId: string | number, photo: string, caption?: string): Promise<void>;
    handleIncomingMessage(chatId: number, message: string, username?: string): Promise<void>;
    setWebhook(url: string): Promise<void>;
    deleteWebhook(): Promise<void>;
    getWebhookInfo(): Promise<any>;
    getBotInfo(): Promise<any>;
    testConnection(): Promise<{
        success: boolean;
        message: string;
        botInfo?: any;
    }>;
    isConfigured(): boolean;
    extractChatId(telegramUpdate: any): number | null;
    extractMessageText(telegramUpdate: any): string;
    extractUsername(telegramUpdate: any): string | undefined;
    extractFirstName(telegramUpdate: any): string | undefined;
}
