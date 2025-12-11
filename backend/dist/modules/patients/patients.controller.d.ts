import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateGyneProfileDto } from './dto/create-gyne-profile.dto';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    create(createPatientDto: CreatePatientDto): Promise<import("../../entities/patient.entity").Patient>;
    findAll(): Promise<import("../../entities/patient.entity").Patient[]>;
    findOne(id: string): Promise<import("../../entities/patient.entity").Patient>;
    findByPhone(phoneNumber: string): Promise<import("../../entities/patient.entity").Patient>;
    update(id: string, updatePatientDto: UpdatePatientDto): Promise<import("../../entities/patient.entity").Patient>;
    createGyneProfile(id: string, profileDto: CreateGyneProfileDto): Promise<import("../../entities/gyne-profile.entity").GyneProfile>;
    createPregnancy(id: string, pregnancyDto: CreatePregnancyDto): Promise<import("../../entities/pregnancy.entity").Pregnancy>;
    getCurrentPregnancy(id: string): Promise<import("../../entities/pregnancy.entity").Pregnancy>;
}
