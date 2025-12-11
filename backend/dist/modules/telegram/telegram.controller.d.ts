import { TelegramService } from './telegram.service';
export declare class TelegramController {
    private readonly telegramService;
    constructor(telegramService: TelegramService);
    handleWebhook(body: any): Promise<{
        ok: boolean;
        error?: undefined;
    } | {
        ok: boolean;
        error: any;
    }>;
    getWebhookInfo(): Promise<any>;
    setWebhook(body: {
        url: string;
    }): Promise<{
        success: boolean;
        message: any;
    }>;
    testConnection(): Promise<{
        success: boolean;
        message: string;
        botInfo?: any;
    }>;
    getBotInfo(): Promise<{
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    healthCheck(): Promise<{
        configured: boolean;
        connection: {
            success: boolean;
            message: string;
            botInfo?: any;
        };
        webhook: any;
    }>;
    testMessage(body: {
        chatId: string | number;
        message?: string;
    }): Promise<{
        success: boolean;
        message: any;
    }>;
}
