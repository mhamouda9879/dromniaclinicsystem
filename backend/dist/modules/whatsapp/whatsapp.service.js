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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const conversation_service_1 = require("./conversation.service");
let WhatsAppService = class WhatsAppService {
    constructor(configService, conversationService) {
        this.configService = configService;
        this.conversationService = conversationService;
        this.apiUrl = this.configService.get('WHATSAPP_API_URL');
        this.phoneNumberId = this.configService.get('WHATSAPP_PHONE_NUMBER_ID');
        this.accessToken = this.configService.get('WHATSAPP_ACCESS_TOKEN');
    }
    async sendMessage(to, message) {
        try {
            await axios_1.default.post(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: { body: message },
            }, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
        }
        catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw error;
        }
    }
    async sendTemplateMessage(to, templateName, parameters = []) {
        try {
            await axios_1.default.post(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
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
            }, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
        }
        catch (error) {
            console.error('Error sending WhatsApp template:', error);
            throw error;
        }
    }
    async handleIncomingMessage(from, message) {
        const response = await this.conversationService.processMessage(from, message);
        if (response) {
            await this.sendMessage(from, response);
        }
    }
    extractPhoneNumber(whatsappId) {
        return whatsappId.replace('whatsapp:', '');
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        conversation_service_1.ConversationService])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map