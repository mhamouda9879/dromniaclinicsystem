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
exports.NotificationLog = exports.NotificationStatus = exports.NotificationChannel = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("./patient.entity");
const appointment_entity_1 = require("./appointment.entity");
var NotificationType;
(function (NotificationType) {
    NotificationType["BOOKING_CONFIRMATION"] = "booking_confirmation";
    NotificationType["REMINDER_24H"] = "reminder_24h";
    NotificationType["REMINDER_1H"] = "reminder_1h";
    NotificationType["REMINDER_30M"] = "reminder_30m";
    NotificationType["QUEUE_UPDATE"] = "queue_update";
    NotificationType["THANK_YOU"] = "thank_you";
    NotificationType["FEEDBACK_REQUEST"] = "feedback_request";
    NotificationType["PREGNANCY_MILESTONE"] = "pregnancy_milestone";
    NotificationType["APPOINTMENT_CANCELLED"] = "appointment_cancelled";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["WHATSAPP"] = "whatsapp";
    NotificationChannel["TELEGRAM"] = "telegram";
    NotificationChannel["SMS"] = "sms";
    NotificationChannel["EMAIL"] = "email";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["FAILED"] = "failed";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
let NotificationLog = class NotificationLog {
};
exports.NotificationLog = NotificationLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NotificationLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], NotificationLog.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], NotificationLog.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationType,
    }),
    __metadata("design:type", String)
], NotificationLog.prototype, "notificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationChannel,
        default: NotificationChannel.TELEGRAM,
    }),
    __metadata("design:type", String)
], NotificationLog.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], NotificationLog.prototype, "messageTemplateKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], NotificationLog.prototype, "messageContent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.PENDING,
    }),
    __metadata("design:type", String)
], NotificationLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], NotificationLog.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], NotificationLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationLog.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient),
    (0, typeorm_1.JoinColumn)({ name: 'patientId' }),
    __metadata("design:type", patient_entity_1.Patient)
], NotificationLog.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_entity_1.Appointment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'appointmentId' }),
    __metadata("design:type", appointment_entity_1.Appointment)
], NotificationLog.prototype, "appointment", void 0);
exports.NotificationLog = NotificationLog = __decorate([
    (0, typeorm_1.Entity)('notification_logs'),
    (0, typeorm_1.Index)(['patientId', 'createdAt']),
    (0, typeorm_1.Index)(['status', 'createdAt'])
], NotificationLog);
//# sourceMappingURL=notification-log.entity.js.map