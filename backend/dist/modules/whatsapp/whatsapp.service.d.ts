import { ConfigService } from '@nestjs/config';
import { ConversationService } from './conversation.service';
export declare class WhatsAppService {
    private configService;
    private conversationService;
    private readonly apiUrl;
    private readonly phoneNumberId;
    private readonly accessToken;
    constructor(configService: ConfigService, conversationService: ConversationService);
    sendMessage(to: string, message: string): Promise<void>;
    sendTemplateMessage(to: string, templateName: string, parameters?: string[]): Promise<void>;
    handleIncomingMessage(from: string, message: string): Promise<void>;
    extractPhoneNumber(whatsappId: string): string;
}
