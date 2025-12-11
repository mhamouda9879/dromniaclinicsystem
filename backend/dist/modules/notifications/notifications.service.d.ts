import { Repository } from 'typeorm';
import { NotificationLog } from '../../entities/notification-log.entity';
import { TelegramService } from '../telegram/telegram.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { PatientsService } from '../patients/patients.service';
export declare class NotificationsService {
    private notificationRepository;
    private telegramService;
    private appointmentsService;
    private patientsService;
    constructor(notificationRepository: Repository<NotificationLog>, telegramService: TelegramService, appointmentsService: AppointmentsService, patientsService: PatientsService);
    sendBookingConfirmation(appointmentId: string): Promise<NotificationLog>;
    sendReminder24Hours(): Promise<void>;
    sendReminder1Hour(): Promise<void>;
    sendReminder30Minutes(): Promise<void>;
    private sendReminder;
    sendQueueUpdate(appointmentId: string, queuePosition: number, estimatedWaitTime: number): Promise<NotificationLog>;
    sendThankYouMessage(appointmentId: string): Promise<NotificationLog>;
    sendPregnancyMilestoneReminder(patientId: string, message: string): Promise<NotificationLog>;
    private buildBookingConfirmationMessage;
    private buildReminderMessage;
    private createNotificationLog;
    getNotificationHistory(patientId: string): Promise<NotificationLog[]>;
}
