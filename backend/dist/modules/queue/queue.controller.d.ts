import { QueueService } from './queue.service';
export declare class QueueController {
    private readonly queueService;
    constructor(queueService: QueueService);
    getTodayQueue(): Promise<import("../../entities/appointment.entity").Appointment[]>;
    getCurrentPatient(): Promise<import("../../entities/appointment.entity").Appointment>;
    getNextPatient(): Promise<import("../../entities/appointment.entity").Appointment>;
    getQueuePosition(patientId: string): Promise<number>;
    getWaitingRoomDisplay(): Promise<{
        currentNumber: number | null;
        nextNumber: number | null;
        currentPatient: string | null;
        nextPatient: string | null;
    }>;
    markAsArrived(id: string): Promise<import("../../entities/appointment.entity").Appointment>;
    startConsultation(id: string): Promise<import("../../entities/appointment.entity").Appointment>;
    finishConsultation(id: string): Promise<import("../../entities/appointment.entity").Appointment>;
    reorderQueue(id: string, queueNumber: number): Promise<import("../../entities/appointment.entity").Appointment>;
}
