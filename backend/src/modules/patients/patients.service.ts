import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { GyneProfile } from '../../entities/gyne-profile.entity';
import { Pregnancy } from '../../entities/pregnancy.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateGyneProfileDto } from './dto/create-gyne-profile.dto';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(GyneProfile)
    private gyneProfileRepository: Repository<GyneProfile>,
    @InjectRepository(Pregnancy)
    private pregnancyRepository: Repository<Pregnancy>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientRepository.create(createPatientDto);
    return await this.patientRepository.save(patient);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Patient | null> {
    return await this.patientRepository.findOne({
      where: { phoneNumber },
      relations: ['gyneProfile', 'pregnancies'],
    });
  }

  async findByTelegramChatId(chatId: number): Promise<Patient | null> {
    return await this.patientRepository.findOne({
      where: { telegramChatId: chatId },
      relations: ['gyneProfile', 'pregnancies'],
    });
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['gyneProfile', 'pregnancies', 'appointments'],
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async findAll(): Promise<Patient[]> {
    return await this.patientRepository.find({
      relations: ['gyneProfile'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    Object.assign(patient, updatePatientDto);
    return await this.patientRepository.save(patient);
  }

  async createOrUpdateGyneProfile(
    patientId: string,
    profileDto: CreateGyneProfileDto,
  ): Promise<GyneProfile> {
    const patient = await this.findOne(patientId);
    
    let profile = await this.gyneProfileRepository.findOne({
      where: { patientId },
    });

    if (profile) {
      Object.assign(profile, profileDto);
    } else {
      profile = this.gyneProfileRepository.create({
        ...profileDto,
        patientId,
      });
    }

    return await this.gyneProfileRepository.save(profile);
  }

  async createPregnancy(
    patientId: string,
    pregnancyDto: CreatePregnancyDto,
  ): Promise<Pregnancy> {
    const patient = await this.findOne(patientId);
    const pregnancy = this.pregnancyRepository.create({
      ...pregnancyDto,
      patientId,
    });
    return await this.pregnancyRepository.save(pregnancy);
  }

  async getCurrentPregnancy(patientId: string): Promise<Pregnancy | null> {
    return await this.pregnancyRepository.findOne({
      where: { patientId, isCurrent: true },
      order: { createdAt: 'DESC' },
    });
  }
}

