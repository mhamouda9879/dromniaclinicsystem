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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_log_entity_1 = require("../../entities/notification-log.entity");
const telegram_service_1 = require("../telegram/telegram.service");
const appointments_service_1 = require("../appointments/appointments.service");
const patients_service_1 = require("../patients/patients.service");
const date_fns_1 = require("date-fns");
const appointment_entity_1 = require("../../entities/appointment.entity");
let NotificationsService = class NotificationsService {
    constructor(notificationRepository, telegramService, appointmentsService, patientsService) {
        this.notificationRepository = notificationRepository;
        this.telegramService = telegramService;
        this.appointmentsService = appointmentsService;
        this.patientsService = patientsService;
    }
    async sendBookingConfirmation(appointmentId) {
        const appointment = await this.appointmentsService.findOne(appointmentId);
        const patient = appointment.patient;
        const message = this.buildBookingConfirmationMessage(appointment);
        try {
            const chatId = patient.telegramChatId;
            if (!chatId) {
                throw new Error('Patient does not have a Telegram chat ID');
            }
            await this.telegramService.sendMessage(chatId, message);
            return await this.createNotificationLog({
                patientId: patient.id,
                appointmentId,
                notificationType: notification_log_entity_1.NotificationType.BOOKING_CONFIRMATION,
                messageContent: message,
                status: notification_log_entity_1.NotificationStatus.SENT,
                sentAt: new Date(),
            });
        }
        catch (error) {
            return await this.createNotificationLog({
                patientId: patient.id,
                appointmentId,
                notificationType: notification_log_entity_1.NotificationType.BOOKING_CONFIRMATION,
                messageContent: message,
                status: notification_log_entity_1.NotificationStatus.FAILED,
                errorMessage: error.message,
            });
        }
    }
    async sendReminder24Hours() {
        const tomorrow = (0, date_fns_1.addDays)(new Date(), 1);
        const appointments = await this.appointmentsService.findByDate((0, date_fns_1.format)(tomorrow, 'yyyy-MM-dd'));
        for (const appointment of appointments) {
            if (appointment.status === appointment_entity_1.AppointmentStatus.CONFIRMED ||
                appointment.status === appointment_entity_1.AppointmentStatus.BOOKED) {
                const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
                const hoursUntil = (0, date_fns_1.differenceInHours)(appointmentDateTime, new Date());
                if (hoursUntil >= 24 && hoursUntil < 25) {
                    await this.sendReminder(appointment.id, notification_log_entity_1.NotificationType.REMINDER_24H);
                }
            }
        }
    }
    async sendReminder1Hour() {
        const today = new Date();
        const appointments = await this.appointmentsService.findByDate((0, date_fns_1.format)(today, 'yyyy-MM-dd'));
        for (const appointment of appointments) {
            if (appointment.status === appointment_entity_1.AppointmentStatus.CONFIRMED ||
                appointment.status === appointment_entity_1.AppointmentStatus.BOOKED) {
                const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
                const hoursUntil = (0, date_fns_1.differenceInHours)(appointmentDateTime, new Date());
                if (hoursUntil >= 1 && hoursUntil < 2) {
                    await this.sendReminder(appointment.id, notification_log_entity_1.NotificationType.REMINDER_1H);
                }
            }
        }
    }
    async sendReminder30Minutes() {
        const today = new Date();
        const appointments = await this.appointmentsService.findByDate((0, date_fns_1.format)(today, 'yyyy-MM-dd'));
        for (const appointment of appointments) {
            if (appointment.status === appointment_entity_1.AppointmentStatus.CONFIRMED ||
                appointment.status === appointment_entity_1.AppointmentStatus.BOOKED) {
                const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
                const hoursUntil = (0, date_fns_1.differenceInHours)(appointmentDateTime, new Date());
                if (hoursUntil >= 0.5 && hoursUntil < 1) {
                    await this.sendReminder(appointment.id, notification_log_entity_1.NotificationType.REMINDER_30M);
                }
            }
        }
    }
    async sendReminder(appointmentId, type) {
        const appointment = await this.appointmentsService.findOne(appointmentId);
        const patient = appointment.patient;
        const existing = await this.notificationRepository.findOne({
            where: {
                appointmentId,
                notificationType: type,
                status: notification_log_entity_1.NotificationStatus.SENT,
            },
        });
        if (existing) {
            return existing;
        }
        const message = this.buildReminderMessage(appointment, type);
        try {
            const chatId = patient.telegramChatId;
            if (!chatId) {
                throw new Error('Patient does not have a Telegram chat ID');
            }
            await this.telegramService.sendMessage(chatId, message);
            return await this.createNotificationLog({
                patientId: patient.id,
                appointmentId,
                notificationType: type,
                messageContent: message,
                status: notification_log_entity_1.NotificationStatus.SENT,
                sentAt: new Date(),
            });
        }
        catch (error) {
            return await this.createNotificationLog({
                patientId: patient.id,
                appointmentId,
                notificationType: type,
                messageContent: message,
                status: notification_log_entity_1.NotificationStatus.FAILED,
                errorMessage: error.message,
            });
        }
    }
    async sendQueueUpdate(appointmentId, queuePosition, estimatedWaitTime) {
        const appointment = await this.appointmentsService.findOne(appointmentId);
        const patient = appointment.patient;
        const message = `📊 *Queue Update*

The doctor is currently seeing patients. Your queue number is ${appointment.queueNumber}.

📍 Your position: ${queuePosition}
⏱️ Estimated wait time: ${estimatedWaitTime} minutes

Please be ready when your number is called.`;
        try {
            const chatId = patient.telegramChatId;
            if (!chatId) {
                throw new Error('Patient does not have a Telegram chat ID');
            }
            await this.telegramService.sendMessage(chatId, message);
            return await this.createNotificationLog({
                patientId: patient.id,
                appointmentId,
                notificationType: notification_log_entity_1.NotificationType.QUEUE_UPDATE,
                messageContent: message,
                status: notification_log_entity_1.NotificationStatus.SENT,
                sentAt: new Date(),
            });
        }
        catch (error) {
            return await this.createNotificationLog({
                patientId: patient.id,
                appointmentId,
                notificationType: notification_log_entity_1.NotificationType.QUEUE_UPDATE,
                messageContent: message,
                status: notification_log_entity_1.NotificationStatus.FAILED,
                errorMessage: error.message,
            });
        }
    }
    async sendThankYouMessage(appointmentId) {
        const appointment = await this.appointmentsService.findOne(appointmentId);
        const patient = appointment.patient;
        const message = `🙏 *Thank You for Visiting Our Clinic*

We hope you had a pleasant experience today. Your health is our priority.

💬 *Quick Feedback*
Please reply with:
👍 - Good experience
👎 - Needs improvement

Your feedback helps us serve you better.`;
        try {
            const chatId = patient.telegramChatId;
            if (!chatId) {
                throw new Error('Patient does not have a Telegram chat ID');
            }
            await this.telegramService.sendMessage(chatId, message);
            return await this.createNotificationLog({
                patientId: patient.id,
                appointmentId,
                notificationType: notification_log_entity_1.NotificationType.THANK_YOU,
                messageContent: message,
                status: notification_log_entity_1.NotificationStatus.SENT,
                sentAt: new Date(),
            });
        }
        catch (error) {
            return await this.createNotificationLog({
                patientId: patient.id,
                appointmentId,
                notificationType: notification_log_entity_1.NotificationType.THANK_YOU,
                messageContent: message,
                status: notification_log_entity_1.NotificationStatus.FAILED,
                errorMessage: error.message,
            });
        }
    }
    async sendPregnancyMilestoneReminder(patientId, message) {
        const patient = await this.patientsService.findOne(patientId);
        try {
            const chatId = patient.telegramChatId;
            if (!chatId) {
                throw new Error('Patient does not have a Telegram chat ID');
            }
            await this.telegramService.sendMessage(chatId, message);
            return await this.createNotificationLog({
                patientId: patient.id,
                notificationType: notification_log_entity_1.NotificationType.PREGNANCY_MILESTONE,
                messageContent: message,
                status: notification_log_entity_1.NotificationStatus.SENT,
                sentAt: new Date(),
            });
        }
        catch (error) {
            return await this.createNotificationLog({
                patientId: patient.id,
                notificationType: notification_log_entity_1.NotificationType.PREGNANCY_MILESTONE,
                messageContent: message,
                status: notification_log_entity_1.NotificationStatus.FAILED,
                errorMessage: error.message,
            });
        }
    }
    buildBookingConfirmationMessage(appointment) {
        const date = (0, date_fns_1.format)(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy');
        const visitTypeLabels = {
            pregnancy_first_visit: 'Pregnancy First Visit',
            pregnancy_followup: 'Pregnancy Follow-up',
            ultrasound: 'Ultrasound',
            postpartum_normal: 'Postpartum Follow-up (Normal)',
            postpartum_csection: 'Postpartum Follow-up (C-section)',
            family_planning: 'Family Planning',
            infertility: 'Infertility Consultation',
            general_gyne: 'General Gynecology',
            pap_smear: 'Pap Smear',
            emergency: 'Emergency Visit',
        };
        return `✅ *Appointment Confirmed*

📅 *Date:* ${date}
🕐 *Time:* ${appointment.appointmentTime}
🏥 *Type:* ${visitTypeLabels[appointment.visitType] || appointment.visitType}
🔢 *Queue Number:* ${appointment.queueNumber || 'Will be assigned'}

⏰ *Please arrive 10-15 minutes before your appointment time.*

Thank you for choosing our clinic! We look forward to seeing you.`;
    }
    buildReminderMessage(appointment, type) {
        const date = (0, date_fns_1.format)(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy');
        let timeMessage = '';
        if (type === notification_log_entity_1.NotificationType.REMINDER_24H) {
            timeMessage = '24 hours';
        }
        else if (type === notification_log_entity_1.NotificationType.REMINDER_1H) {
            timeMessage = '1 hour';
        }
        else if (type === notification_log_entity_1.NotificationType.REMINDER_30M) {
            timeMessage = '30 minutes';
        }
        return `⏰ *Reminder: Your Appointment is in ${timeMessage}*

📅 *Date:* ${date}
🕐 *Time:* ${appointment.appointmentTime}
🔢 *Queue Number:* ${appointment.queueNumber || 'Will be assigned'}

Please be on time. We look forward to seeing you!`;
    }
    async createNotificationLog(data) {
        const log = this.notificationRepository.create({
            ...data,
            channel: notification_log_entity_1.NotificationChannel.TELEGRAM,
        });
        return await this.notificationRepository.save(log);
    }
    async getNotificationHistory(patientId) {
        return await this.notificationRepository.find({
            where: { patientId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_log_entity_1.NotificationLog)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => telegram_service_1.TelegramService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        telegram_service_1.TelegramService,
        appointments_service_1.AppointmentsService,
        patients_service_1.PatientsService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map