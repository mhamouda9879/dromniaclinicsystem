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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patient_entity_1 = require("../../entities/patient.entity");
const gyne_profile_entity_1 = require("../../entities/gyne-profile.entity");
const pregnancy_entity_1 = require("../../entities/pregnancy.entity");
let PatientsService = class PatientsService {
    constructor(patientRepository, gyneProfileRepository, pregnancyRepository) {
        this.patientRepository = patientRepository;
        this.gyneProfileRepository = gyneProfileRepository;
        this.pregnancyRepository = pregnancyRepository;
    }
    async create(createPatientDto) {
        const patient = this.patientRepository.create(createPatientDto);
        return await this.patientRepository.save(patient);
    }
    async findByPhoneNumber(phoneNumber) {
        return await this.patientRepository.findOne({
            where: { phoneNumber },
            relations: ['gyneProfile', 'pregnancies'],
        });
    }
    async findByTelegramChatId(chatId) {
        return await this.patientRepository.findOne({
            where: { telegramChatId: chatId },
            relations: ['gyneProfile', 'pregnancies'],
        });
    }
    async findOne(id) {
        const patient = await this.patientRepository.findOne({
            where: { id },
            relations: ['gyneProfile', 'pregnancies', 'appointments'],
        });
        if (!patient) {
            throw new common_1.NotFoundException(`Patient with ID ${id} not found`);
        }
        return patient;
    }
    async findAll() {
        return await this.patientRepository.find({
            relations: ['gyneProfile'],
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, updatePatientDto) {
        const patient = await this.findOne(id);
        Object.assign(patient, updatePatientDto);
        return await this.patientRepository.save(patient);
    }
    async createOrUpdateGyneProfile(patientId, profileDto) {
        const patient = await this.findOne(patientId);
        let profile = await this.gyneProfileRepository.findOne({
            where: { patientId },
        });
        if (profile) {
            Object.assign(profile, profileDto);
        }
        else {
            profile = this.gyneProfileRepository.create({
                ...profileDto,
                patientId,
            });
        }
        return await this.gyneProfileRepository.save(profile);
    }
    async createPregnancy(patientId, pregnancyDto) {
        const patient = await this.findOne(patientId);
        const pregnancy = this.pregnancyRepository.create({
            ...pregnancyDto,
            patientId,
        });
        return await this.pregnancyRepository.save(pregnancy);
    }
    async getCurrentPregnancy(patientId) {
        return await this.pregnancyRepository.findOne({
            where: { patientId, isCurrent: true },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(1, (0, typeorm_1.InjectRepository)(gyne_profile_entity_1.GyneProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(pregnancy_entity_1.Pregnancy)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PatientsService);
//# sourceMappingURL=patients.service.js.map