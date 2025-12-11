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
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("../../entities/appointment.entity");
const appointments_service_1 = require("../appointments/appointments.service");
let QueueService = class QueueService {
    constructor(appointmentRepository, appointmentsService) {
        this.appointmentRepository = appointmentRepository;
        this.appointmentsService = appointmentsService;
    }
    async getTodayQueue() {
        const appointments = await this.appointmentsService.findToday();
        return appointments
            .filter((apt) => apt.status !== appointment_entity_1.AppointmentStatus.CANCELLED &&
            apt.status !== appointment_entity_1.AppointmentStatus.FINISHED &&
            apt.status !== appointment_entity_1.AppointmentStatus.NO_SHOW)
            .sort((a, b) => {
            if (a.emergencyFlag && !b.emergencyFlag)
                return -1;
            if (!a.emergencyFlag && b.emergencyFlag)
                return 1;
            return (a.queueNumber || 0) - (b.queueNumber || 0);
        });
    }
    async getCurrentPatient() {
        const queue = await this.getTodayQueue();
        return queue.find((apt) => apt.status === appointment_entity_1.AppointmentStatus.WITH_DOCTOR) || null;
    }
    async getNextPatient() {
        const queue = await this.getTodayQueue();
        return queue.find((apt) => apt.status === appointment_entity_1.AppointmentStatus.ARRIVED) || null;
    }
    async getQueuePosition(patientId) {
        const queue = await this.getTodayQueue();
        const index = queue.findIndex((apt) => apt.patientId === patientId);
        return index >= 0 ? index + 1 : null;
    }
    async getEstimatedWaitTime(queuePosition) {
        const averageConsultationTime = 15;
        return (queuePosition - 1) * averageConsultationTime;
    }
    async markAsArrived(appointmentId) {
        return await this.appointmentsService.updateStatus(appointmentId, appointment_entity_1.AppointmentStatus.ARRIVED);
    }
    async startConsultation(appointmentId) {
        return await this.appointmentsService.updateStatus(appointmentId, appointment_entity_1.AppointmentStatus.WITH_DOCTOR);
    }
    async finishConsultation(appointmentId) {
        return await this.appointmentsService.updateStatus(appointmentId, appointment_entity_1.AppointmentStatus.FINISHED);
    }
    async reorderQueue(appointmentId, newQueueNumber) {
        const appointment = await this.appointmentsService.findOne(appointmentId);
        appointment.queueNumber = newQueueNumber;
        return await this.appointmentRepository.save(appointment);
    }
    async getWaitingRoomDisplay() {
        const current = await this.getCurrentPatient();
        const next = await this.getNextPatient();
        const anonymizeName = (name) => {
            const parts = name.split(' ');
            if (parts.length >= 2) {
                return `${parts[0][0]}. ${parts[parts.length - 1]}`;
            }
            return name.substring(0, 2) + '***';
        };
        return {
            currentNumber: current?.queueNumber || null,
            nextNumber: next?.queueNumber || null,
            currentPatient: current ? anonymizeName(current.patient.fullName) : null,
            nextPatient: next ? anonymizeName(next.patient.fullName) : null,
        };
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        appointments_service_1.AppointmentsService])
], QueueService);
//# sourceMappingURL=queue.service.js.map