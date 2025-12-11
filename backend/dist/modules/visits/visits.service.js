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
exports.VisitsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const visit_entity_1 = require("../../entities/visit.entity");
const appointments_service_1 = require("../appointments/appointments.service");
let VisitsService = class VisitsService {
    constructor(visitRepository, appointmentsService) {
        this.visitRepository = visitRepository;
        this.appointmentsService = appointmentsService;
    }
    async create(createVisitDto) {
        await this.appointmentsService.findOne(createVisitDto.appointmentId);
        const existing = await this.visitRepository.findOne({
            where: { appointmentId: createVisitDto.appointmentId },
        });
        if (existing) {
            throw new common_1.NotFoundException('Visit already exists for this appointment');
        }
        const visit = this.visitRepository.create(createVisitDto);
        return await this.visitRepository.save(visit);
    }
    async findByAppointment(appointmentId) {
        return await this.visitRepository.findOne({
            where: { appointmentId },
            relations: ['appointment', 'appointment.patient'],
        });
    }
    async findOne(id) {
        const visit = await this.visitRepository.findOne({
            where: { id },
            relations: ['appointment', 'appointment.patient'],
        });
        if (!visit) {
            throw new common_1.NotFoundException(`Visit with ID ${id} not found`);
        }
        return visit;
    }
    async update(id, updateVisitDto) {
        const visit = await this.findOne(id);
        Object.assign(visit, updateVisitDto);
        return await this.visitRepository.save(visit);
    }
    async findByPatient(patientId) {
        return await this.visitRepository.find({
            relations: ['appointment'],
            where: {
                appointment: {
                    patientId,
                },
            },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.VisitsService = VisitsService;
exports.VisitsService = VisitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(visit_entity_1.Visit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        appointments_service_1.AppointmentsService])
], VisitsService);
//# sourceMappingURL=visits.service.js.map