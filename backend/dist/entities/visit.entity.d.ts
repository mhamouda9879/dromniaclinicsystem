import { Appointment } from './appointment.entity';
export declare class Visit {
    id: string;
    appointmentId: string;
    chiefComplaint: string;
    subjectiveNotes: string;
    examinationSummary: string;
    investigations: string[];
    diagnosisSummary: string;
    treatmentPlan: string;
    prescribedMedications: Record<string, any>[];
    nextVisitRecommendation: string;
    createdAt: Date;
    updatedAt: Date;
    appointment: Appointment;
}
