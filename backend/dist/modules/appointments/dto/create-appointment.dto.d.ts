import { VisitType, AppointmentStatus, AppointmentSource } from '../../../entities/appointment.entity';
export declare class CreateAppointmentDto {
    patientId: string;
    visitType: VisitType;
    appointmentDate: string;
    appointmentTime: string;
    queueNumber?: number;
    status?: AppointmentStatus;
    emergencyFlag?: boolean;
    source?: AppointmentSource;
    notes?: string;
    bookingData?: Record<string, any>;
}
