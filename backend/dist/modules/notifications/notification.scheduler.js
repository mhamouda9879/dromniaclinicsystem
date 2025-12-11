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
exports.NotificationScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const notifications_service_1 = require("./notifications.service");
const appointments_service_1 = require("../appointments/appointments.service");
const patients_service_1 = require("../patients/patients.service");
const date_fns_1 = require("date-fns");
let NotificationScheduler = class NotificationScheduler {
    constructor(notificationsService, appointmentsService, patientsService) {
        this.notificationsService = notificationsService;
        this.appointmentsService = appointmentsService;
        this.patientsService = patientsService;
    }
    async handle24HourReminders() {
        console.log('Checking for 24-hour reminders...');
        await this.notificationsService.sendReminder24Hours();
    }
    async handle1HourReminders() {
        console.log('Checking for 1-hour reminders...');
        await this.notificationsService.sendReminder1Hour();
    }
    async handle30MinuteReminders() {
        console.log('Checking for 30-minute reminders...');
        await this.notificationsService.sendReminder30Minutes();
    }
    async handlePregnancyMilestones() {
        console.log('Checking for pregnancy milestone reminders...');
        const patients = await this.patientsService.findAll();
        for (const patient of patients) {
            if (patient.pregnancies && patient.pregnancies.length > 0) {
                const currentPregnancy = patient.pregnancies.find(p => p.isCurrent);
                if (currentPregnancy && currentPregnancy.lmpDate) {
                    const gestationWeeks = (0, date_fns_1.differenceInWeeks)(new Date(), currentPregnancy.lmpDate);
                    if (gestationWeeks >= 11 && gestationWeeks <= 13) {
                        await this.notificationsService.sendPregnancyMilestoneReminder(patient.id, `📅 *Pregnancy Milestone Reminder*

You are now around ${gestationWeeks} weeks pregnant. We recommend a follow-up pregnancy visit and possibly an ultrasound scan around this time.

If you haven't booked your appointment yet, you can easily book via WhatsApp by replying to this message with any number from the main menu.`);
                    }
                    else if (gestationWeeks >= 19 && gestationWeeks <= 23) {
                        await this.notificationsService.sendPregnancyMilestoneReminder(patient.id, `📅 *Pregnancy Milestone Reminder*

You are now around ${gestationWeeks} weeks pregnant. This is an important time for an anomaly scan (detailed ultrasound) to check your baby's development.

If you haven't booked your scan yet, you can easily book via WhatsApp by replying to this message.`);
                    }
                    else if (gestationWeeks >= 27 && gestationWeeks <= 29) {
                        await this.notificationsService.sendPregnancyMilestoneReminder(patient.id, `📅 *Pregnancy Milestone Reminder*

You are now entering your third trimester (around ${gestationWeeks} weeks). Regular follow-up visits become more important during this period.

If you haven't booked your follow-up appointment yet, you can easily book via WhatsApp by replying to this message.`);
                    }
                }
            }
        }
    }
    async handlePostpartumReminders() {
        console.log('Checking for postpartum reminders...');
    }
};
exports.NotificationScheduler = NotificationScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "handle24HourReminders", null);
__decorate([
    (0, schedule_1.Cron)('*/15 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "handle1HourReminders", null);
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "handle30MinuteReminders", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "handlePregnancyMilestones", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_10AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationScheduler.prototype, "handlePostpartumReminders", null);
exports.NotificationScheduler = NotificationScheduler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        appointments_service_1.AppointmentsService,
        patients_service_1.PatientsService])
], NotificationScheduler);
//# sourceMappingURL=notification.scheduler.js.map