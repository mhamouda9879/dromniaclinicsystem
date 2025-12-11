import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';
export declare class WhatsAppController {
    private readonly whatsappService;
    private configService;
    constructor(whatsappService: WhatsAppService, configService: ConfigService);
    verifyWebhook(mode: string, token: string, challenge: string): string | HttpStatus.FORBIDDEN;
    handleWebhook(body: any): Promise<{
        status: string;
    }>;
}
