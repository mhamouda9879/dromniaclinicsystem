import { Patient } from './patient.entity';
import { Visit } from './visit.entity';
export declare enum VisitType {
    PREGNANCY_FIRST_VISIT = "pregnancy_first_visit",
    PREGNANCY_FOLLOWUP = "pregnancy_followup",
    ULTRASOUND = "ultrasound",
    POSTPARTUM_NORMAL = "postpartum_normal",
    POSTPARTUM_CSECTION = "postpartum_csection",
    FAMILY_PLANNING = "family_planning",
    INFERTILITY = "infertility",
    GENERAL_GYNE = "general_gyne",
    PAP_SMEAR = "pap_smear",
    EMERGENCY = "emergency"
}
export declare enum AppointmentStatus {
    BOOKED = "booked",
    CONFIRMED = "confirmed",
    ARRIVED = "arrived",
    WITH_DOCTOR = "with_doctor",
    FINISHED = "finished",
    NO_SHOW = "no_show",
    CANCELLED = "cancelled"
}
export declare enum AppointmentSource {
    WHATSAPP = "whatsapp",
    TELEGRAM = "telegram",
    WALK_IN = "walk_in",
    PHONE = "phone",
    OTHER = "other"
}
export declare class Appointment {
    id: string;
    patientId: string;
    visitType: VisitType;
    appointmentDate: Date;
    appointmentTime: string;
    queueNumber: number;
    status: AppointmentStatus;
    emergencyFlag: boolean;
    source: AppointmentSource;
    notes: string;
    bookingData: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    patient: Patient;
    visit: Visit;
}
