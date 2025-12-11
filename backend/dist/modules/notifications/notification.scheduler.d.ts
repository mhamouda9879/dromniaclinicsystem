import { NotificationsService } from './notifications.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { PatientsService } from '../patients/patients.service';
export declare class NotificationScheduler {
    private notificationsService;
    private appointmentsService;
    private patientsService;
    constructor(notificationsService: NotificationsService, appointmentsService: AppointmentsService, patientsService: PatientsService);
    handle24HourReminders(): Promise<void>;
    handle1HourReminders(): Promise<void>;
    handle30MinuteReminders(): Promise<void>;
    handlePregnancyMilestones(): Promise<void>;
    handlePostpartumReminders(): Promise<void>;
}
