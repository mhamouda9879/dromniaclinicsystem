import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    sendBookingConfirmation(appointmentId: string): Promise<import("../../entities/notification-log.entity").NotificationLog>;
    sendQueueUpdate(appointmentId: string, body: {
        queuePosition: number;
        estimatedWaitTime: number;
    }): Promise<import("../../entities/notification-log.entity").NotificationLog>;
    sendThankYou(appointmentId: string): Promise<import("../../entities/notification-log.entity").NotificationLog>;
    getHistory(patientId: string): Promise<import("../../entities/notification-log.entity").NotificationLog[]>;
}
