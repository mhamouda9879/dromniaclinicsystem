import { Patient } from './patient.entity';
import { Appointment } from './appointment.entity';
export declare enum NotificationType {
    BOOKING_CONFIRMATION = "booking_confirmation",
    REMINDER_24H = "reminder_24h",
    REMINDER_1H = "reminder_1h",
    REMINDER_30M = "reminder_30m",
    QUEUE_UPDATE = "queue_update",
    THANK_YOU = "thank_you",
    FEEDBACK_REQUEST = "feedback_request",
    PREGNANCY_MILESTONE = "pregnancy_milestone",
    APPOINTMENT_CANCELLED = "appointment_cancelled"
}
export declare enum NotificationChannel {
    WHATSAPP = "whatsapp",
    TELEGRAM = "telegram",
    SMS = "sms",
    EMAIL = "email"
}
export declare enum NotificationStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed"
}
export declare class NotificationLog {
    id: string;
    patientId: string;
    appointmentId: string;
    notificationType: NotificationType;
    channel: NotificationChannel;
    messageTemplateKey: string;
    messageContent: string;
    status: NotificationStatus;
    sentAt: Date;
    errorMessage: string;
    createdAt: Date;
    patient: Patient;
    appointment: Appointment;
}
