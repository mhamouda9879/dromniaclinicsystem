import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { GyneProfile } from '../../entities/gyne-profile.entity';
import { Pregnancy } from '../../entities/pregnancy.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateGyneProfileDto } from './dto/create-gyne-profile.dto';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';
export declare class PatientsService {
    private patientRepository;
    private gyneProfileRepository;
    private pregnancyRepository;
    constructor(patientRepository: Repository<Patient>, gyneProfileRepository: Repository<GyneProfile>, pregnancyRepository: Repository<Pregnancy>);
    create(createPatientDto: CreatePatientDto): Promise<Patient>;
    findByPhoneNumber(phoneNumber: string): Promise<Patient | null>;
    findByTelegramChatId(chatId: number): Promise<Patient | null>;
    findOne(id: string): Promise<Patient>;
    findAll(): Promise<Patient[]>;
    update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient>;
    createOrUpdateGyneProfile(patientId: string, profileDto: CreateGyneProfileDto): Promise<GyneProfile>;
    createPregnancy(patientId: string, pregnancyDto: CreatePregnancyDto): Promise<Pregnancy>;
    getCurrentPregnancy(patientId: string): Promise<Pregnancy | null>;
}
