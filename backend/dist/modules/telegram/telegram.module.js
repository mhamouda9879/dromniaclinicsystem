"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const telegram_controller_1 = require("./telegram.controller");
const telegram_service_1 = require("./telegram.service");
const conversation_service_1 = require("./conversation.service");
const patients_module_1 = require("../patients/patients.module");
const appointments_module_1 = require("../appointments/appointments.module");
const notifications_module_1 = require("../notifications/notifications.module");
const queue_module_1 = require("../queue/queue.module");
let TelegramModule = class TelegramModule {
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [
            patients_module_1.PatientsModule,
            appointments_module_1.AppointmentsModule,
            (0, common_1.forwardRef)(() => notifications_module_1.NotificationsModule),
            queue_module_1.QueueModule,
        ],
        controllers: [telegram_controller_1.TelegramController],
        providers: [telegram_service_1.TelegramService, conversation_service_1.ConversationService],
        exports: [telegram_service_1.TelegramService],
    })
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map