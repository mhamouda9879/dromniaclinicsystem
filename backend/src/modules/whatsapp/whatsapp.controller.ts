import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private configService: ConfigService,
  ) {}

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');
    
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    } else {
      return HttpStatus.FORBIDDEN;
    }
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages) {
      return { status: 'ok' };
    }

    const message = value.messages[0];
    const from = message.from;
    const messageText = message.text?.body || '';

    if (messageText) {
      await this.whatsappService.handleIncomingMessage(from, messageText);
    }

    return { status: 'ok' };
  }
}

