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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("../../entities/appointment.entity");
const patients_service_1 = require("../patients/patients.service");
const date_fns_1 = require("date-fns");
let AppointmentsService = class AppointmentsService {
    constructor(appointmentRepository, patientsService) {
        this.appointmentRepository = appointmentRepository;
        this.patientsService = patientsService;
    }
    async create(createAppointmentDto) {
        const { patientId, ...appointmentData } = createAppointmentDto;
        await this.patientsService.findOne(patientId);
        if (!appointmentData.queueNumber) {
            const dateForQueue = typeof appointmentData.appointmentDate === 'string'
                ? new Date(appointmentData.appointmentDate)
                : appointmentData.appointmentDate;
            appointmentData.queueNumber = await this.getNextQueueNumber(dateForQueue);
        }
        const appointment = this.appointmentRepository.create({
            ...appointmentData,
            patientId,
        });
        return await this.appointmentRepository.save(appointment);
    }
    async findAll() {
        return await this.appointmentRepository.find({
            relations: ['patient'],
            order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
        });
    }
    async findByDate(date) {
        const appointmentDate = new Date(date);
        return await this.appointmentRepository.find({
            where: {
                appointmentDate: (0, typeorm_2.Between)(new Date(appointmentDate.setHours(0, 0, 0, 0)), new Date(appointmentDate.setHours(23, 59, 59, 999))),
            },
            relations: ['patient'],
            order: { appointmentTime: 'ASC', queueNumber: 'ASC' },
        });
    }
    async findToday() {
        const today = (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd');
        return this.findByDate(today);
    }
    async findOne(id) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: ['patient', 'visit'],
        });
        if (!appointment) {
            throw new common_1.NotFoundException(`Appointment with ID ${id} not found`);
        }
        return appointment;
    }
    async update(id, updateAppointmentDto) {
        const appointment = await this.findOne(id);
        Object.assign(appointment, updateAppointmentDto);
        return await this.appointmentRepository.save(appointment);
    }
    async updateStatus(id, status) {
        const appointment = await this.findOne(id);
        appointment.status = status;
        return await this.appointmentRepository.save(appointment);
    }
    async cancel(id) {
        return this.updateStatus(id, appointment_entity_1.AppointmentStatus.CANCELLED);
    }
    async getAvailableTimeSlots(date) {
        const slots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '15:00', '15:30', '16:00', '16:30',
        ];
        const appointments = await this.findByDate(date);
        const bookedSlots = appointments
            .filter((apt) => apt.status !== appointment_entity_1.AppointmentStatus.CANCELLED)
            .map((apt) => apt.appointmentTime);
        return slots.filter((slot) => !bookedSlots.includes(slot));
    }
    async getAvailableDates(startDate) {
        const start = startDate || new Date();
        const end = (0, date_fns_1.addDays)(start, 30);
        const dates = [];
        for (let date = new Date(start); date <= end; date = (0, date_fns_1.addDays)(date, 1)) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                dates.push(new Date(date));
            }
        }
        return dates;
    }
    async getNextQueueNumber(date) {
        const appointments = await this.findByDate((0, date_fns_1.format)(date, 'yyyy-MM-dd'));
        if (appointments.length === 0) {
            return 1;
        }
        const maxQueueNumber = Math.max(...appointments.map((apt) => apt.queueNumber || 0));
        return maxQueueNumber + 1;
    }
    async findByPatient(patientId) {
        return await this.appointmentRepository.find({
            where: { patientId },
            relations: ['patient'],
            order: { appointmentDate: 'DESC', appointmentTime: 'DESC' },
        });
    }
    async findByStatusAndDate(status, date) {
        const appointmentDate = new Date(date);
        return await this.appointmentRepository.find({
            where: {
                status,
                appointmentDate: (0, typeorm_2.Between)(new Date(appointmentDate.setHours(0, 0, 0, 0)), new Date(appointmentDate.setHours(23, 59, 59, 999))),
            },
            relations: ['patient'],
            order: { queueNumber: 'ASC' },
        });
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        patients_service_1.PatientsService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map