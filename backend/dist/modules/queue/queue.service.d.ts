import { Repository } from 'typeorm';
import { Appointment } from '../../entities/appointment.entity';
import { AppointmentsService } from '../appointments/appointments.service';
export declare class QueueService {
    private appointmentRepository;
    private appointmentsService;
    constructor(appointmentRepository: Repository<Appointment>, appointmentsService: AppointmentsService);
    getTodayQueue(): Promise<Appointment[]>;
    getCurrentPatient(): Promise<Appointment | null>;
    getNextPatient(): Promise<Appointment | null>;
    getQueuePosition(patientId: string): Promise<number | null>;
    getEstimatedWaitTime(queuePosition: number): Promise<number>;
    markAsArrived(appointmentId: string): Promise<Appointment>;
    startConsultation(appointmentId: string): Promise<Appointment>;
    finishConsultation(appointmentId: string): Promise<Appointment>;
    reorderQueue(appointmentId: string, newQueueNumber: number): Promise<Appointment>;
    getWaitingRoomDisplay(): Promise<{
        currentNumber: number | null;
        nextNumber: number | null;
        currentPatient: string | null;
        nextPatient: string | null;
    }>;
}
