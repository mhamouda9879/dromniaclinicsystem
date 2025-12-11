import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ConversationService } from './conversation.service';

@Injectable()
export class WhatsAppService {
  private readonly apiUrl: string;
  private readonly phoneNumberId: string;
  private readonly accessToken: string;

  constructor(
    private configService: ConfigService,
    private conversationService: ConversationService,
  ) {
    this.apiUrl = this.configService.get<string>('WHATSAPP_API_URL');
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    this.accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
  }

  async sendMessage(to: string, message: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    parameters: string[] = [],
  ): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: parameters.length > 0 ? [
              {
                type: 'body',
                parameters: parameters.map((param) => ({
                  type: 'text',
                  text: param,
                })),
              },
            ] : [],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error('Error sending WhatsApp template:', error);
      throw error;
    }
  }

  async handleIncomingMessage(from: string, message: string): Promise<void> {
    // Process incoming message through conversation flow
    const response = await this.conversationService.processMessage(from, message);
    
    if (response) {
      await this.sendMessage(from, response);
    }
  }

  extractPhoneNumber(whatsappId: string): string {
    // Remove whatsapp: prefix if present
    return whatsappId.replace('whatsapp:', '');
  }
}

