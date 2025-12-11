import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from '../../entities/visit.entity';
import { AppointmentsService } from '../appointments/appointments.service';

export interface CreateVisitDto {
  appointmentId: string;
  chiefComplaint?: string;
  subjectiveNotes?: string;
  examinationSummary?: string;
  investigations?: string[];
  diagnosisSummary?: string;
  treatmentPlan?: string;
  prescribedMedications?: Record<string, any>[];
  nextVisitRecommendation?: string;
}

export interface UpdateVisitDto {
  chiefComplaint?: string;
  subjectiveNotes?: string;
  examinationSummary?: string;
  investigations?: string[];
  diagnosisSummary?: string;
  treatmentPlan?: string;
  prescribedMedications?: Record<string, any>[];
  nextVisitRecommendation?: string;
}

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
    private appointmentsService: AppointmentsService,
  ) {}

  async create(createVisitDto: CreateVisitDto): Promise<Visit> {
    // Verify appointment exists
    await this.appointmentsService.findOne(createVisitDto.appointmentId);

    // Check if visit already exists
    const existing = await this.visitRepository.findOne({
      where: { appointmentId: createVisitDto.appointmentId },
    });

    if (existing) {
      throw new NotFoundException('Visit already exists for this appointment');
    }

    const visit = this.visitRepository.create(createVisitDto);
    return await this.visitRepository.save(visit);
  }

  async findByAppointment(appointmentId: string): Promise<Visit | null> {
    return await this.visitRepository.findOne({
      where: { appointmentId },
      relations: ['appointment', 'appointment.patient'],
    });
  }

  async findOne(id: string): Promise<Visit> {
    const visit = await this.visitRepository.findOne({
      where: { id },
      relations: ['appointment', 'appointment.patient'],
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    return visit;
  }

  async update(id: string, updateVisitDto: UpdateVisitDto): Promise<Visit> {
    const visit = await this.findOne(id);
    Object.assign(visit, updateVisitDto);
    return await this.visitRepository.save(visit);
  }

  async findByPatient(patientId: string): Promise<Visit[]> {
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
}

