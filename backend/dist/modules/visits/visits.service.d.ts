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
export declare class VisitsService {
    private visitRepository;
    private appointmentsService;
    constructor(visitRepository: Repository<Visit>, appointmentsService: AppointmentsService);
    create(createVisitDto: CreateVisitDto): Promise<Visit>;
    findByAppointment(appointmentId: string): Promise<Visit | null>;
    findOne(id: string): Promise<Visit>;
    update(id: string, updateVisitDto: UpdateVisitDto): Promise<Visit>;
    findByPatient(patientId: string): Promise<Visit[]>;
}
