import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog, NotificationType, NotificationChannel, NotificationStatus } from '../../entities/notification-log.entity';
import { TelegramService } from '../telegram/telegram.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { PatientsService } from '../patients/patients.service';
import { format, addHours, differenceInHours, addDays } from 'date-fns';
import { AppointmentStatus } from '../../entities/appointment.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationLog)
    private notificationRepository: Repository<NotificationLog>,
    @Inject(forwardRef(() => TelegramService))
    private telegramService: TelegramService,
    private appointmentsService: AppointmentsService,
    private patientsService: PatientsService,
  ) {}

  async sendBookingConfirmation(appointmentId: string): Promise<NotificationLog> {
    const appointment = await this.appointmentsService.findOne(appointmentId);
    const patient = appointment.patient;

    const message = this.buildBookingConfirmationMessage(appointment);

    try {
      const chatId = patient.telegramChatId;
      if (!chatId) {
        throw new Error('Patient does not have a Telegram chat ID');
      }
      await this.telegramService.sendMessage(chatId, message);
      
      return await this.createNotificationLog({
        patientId: patient.id,
        appointmentId,
        notificationType: NotificationType.BOOKING_CONFIRMATION,
        messageContent: message,
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      });
    } catch (error) {
      return await this.createNotificationLog({
        patientId: patient.id,
        appointmentId,
        notificationType: NotificationType.BOOKING_CONFIRMATION,
        messageContent: message,
        status: NotificationStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }

  async sendReminder24Hours(): Promise<void> {
    const tomorrow = addDays(new Date(), 1);
    const appointments = await this.appointmentsService.findByDate(format(tomorrow, 'yyyy-MM-dd'));

    for (const appointment of appointments) {
      if (
        appointment.status === AppointmentStatus.CONFIRMED ||
        appointment.status === AppointmentStatus.BOOKED
      ) {
        const appointmentDateTime = new Date(
          `${appointment.appointmentDate}T${appointment.appointmentTime}`,
        );
        const hoursUntil = differenceInHours(appointmentDateTime, new Date());

        // Send if appointment is between 24-25 hours away
        if (hoursUntil >= 24 && hoursUntil < 25) {
          await this.sendReminder(appointment.id, NotificationType.REMINDER_24H);
        }
      }
    }
  }

  async sendReminder1Hour(): Promise<void> {
    const today = new Date();
    const appointments = await this.appointmentsService.findByDate(format(today, 'yyyy-MM-dd'));

    for (const appointment of appointments) {
      if (
        appointment.status === AppointmentStatus.CONFIRMED ||
        appointment.status === AppointmentStatus.BOOKED
      ) {
        const appointmentDateTime = new Date(
          `${appointment.appointmentDate}T${appointment.appointmentTime}`,
        );
        const hoursUntil = differenceInHours(appointmentDateTime, new Date());

        // Send if appointment is between 1-2 hours away
        if (hoursUntil >= 1 && hoursUntil < 2) {
          await this.sendReminder(appointment.id, NotificationType.REMINDER_1H);
        }
      }
    }
  }

  async sendReminder30Minutes(): Promise<void> {
    const today = new Date();
    const appointments = await this.appointmentsService.findByDate(format(today, 'yyyy-MM-dd'));

    for (const appointment of appointments) {
      if (
        appointment.status === AppointmentStatus.CONFIRMED ||
        appointment.status === AppointmentStatus.BOOKED
      ) {
        const appointmentDateTime = new Date(
          `${appointment.appointmentDate}T${appointment.appointmentTime}`,
        );
        const hoursUntil = differenceInHours(appointmentDateTime, new Date());

        // Send if appointment is between 30-60 minutes away
        if (hoursUntil >= 0.5 && hoursUntil < 1) {
          await this.sendReminder(appointment.id, NotificationType.REMINDER_30M);
        }
      }
    }
  }

  private async sendReminder(
    appointmentId: string,
    type: NotificationType,
  ): Promise<NotificationLog> {
    const appointment = await this.appointmentsService.findOne(appointmentId);
    const patient = appointment.patient;

    // Check if reminder already sent
    const existing = await this.notificationRepository.findOne({
      where: {
        appointmentId,
        notificationType: type,
        status: NotificationStatus.SENT,
      },
    });

    if (existing) {
      return existing; // Already sent
    }

    const message = this.buildReminderMessage(appointment, type);

    try {
      const chatId = patient.telegramChatId;
      if (!chatId) {
        throw new Error('Patient does not have a Telegram chat ID');
      }
      await this.telegramService.sendMessage(chatId, message);
      
      return await this.createNotificationLog({
        patientId: patient.id,
        appointmentId,
        notificationType: type,
        messageContent: message,
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      });
    } catch (error) {
      return await this.createNotificationLog({
        patientId: patient.id,
        appointmentId,
        notificationType: type,
        messageContent: message,
        status: NotificationStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }

  async sendQueueUpdate(appointmentId: string, queuePosition: number, estimatedWaitTime: number): Promise<NotificationLog> {
    const appointment = await this.appointmentsService.findOne(appointmentId);
    const patient = appointment.patient;

    const message = `📊 *Queue Update*

The doctor is currently seeing patients. Your queue number is ${appointment.queueNumber}.

📍 Your position: ${queuePosition}
⏱️ Estimated wait time: ${estimatedWaitTime} minutes

Please be ready when your number is called.`;

    try {
      const chatId = patient.telegramChatId;
      if (!chatId) {
        throw new Error('Patient does not have a Telegram chat ID');
      }
      await this.telegramService.sendMessage(chatId, message);
      
      return await this.createNotificationLog({
        patientId: patient.id,
        appointmentId,
        notificationType: NotificationType.QUEUE_UPDATE,
        messageContent: message,
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      });
    } catch (error) {
      return await this.createNotificationLog({
        patientId: patient.id,
        appointmentId,
        notificationType: NotificationType.QUEUE_UPDATE,
        messageContent: message,
        status: NotificationStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }

  async sendThankYouMessage(appointmentId: string): Promise<NotificationLog> {
    const appointment = await this.appointmentsService.findOne(appointmentId);
    const patient = appointment.patient;

    const message = `🙏 *Thank You for Visiting Our Clinic*

We hope you had a pleasant experience today. Your health is our priority.

💬 *Quick Feedback*
Please reply with:
👍 - Good experience
👎 - Needs improvement

Your feedback helps us serve you better.`;

    try {
      const chatId = patient.telegramChatId;
      if (!chatId) {
        throw new Error('Patient does not have a Telegram chat ID');
      }
      await this.telegramService.sendMessage(chatId, message);
      
      return await this.createNotificationLog({
        patientId: patient.id,
        appointmentId,
        notificationType: NotificationType.THANK_YOU,
        messageContent: message,
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      });
    } catch (error) {
      return await this.createNotificationLog({
        patientId: patient.id,
        appointmentId,
        notificationType: NotificationType.THANK_YOU,
        messageContent: message,
        status: NotificationStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }

  async sendPregnancyMilestoneReminder(patientId: string, message: string): Promise<NotificationLog> {
    const patient = await this.patientsService.findOne(patientId);

    try {
      const chatId = patient.telegramChatId;
      if (!chatId) {
        throw new Error('Patient does not have a Telegram chat ID');
      }
      await this.telegramService.sendMessage(chatId, message);
      
      return await this.createNotificationLog({
        patientId: patient.id,
        notificationType: NotificationType.PREGNANCY_MILESTONE,
        messageContent: message,
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      });
    } catch (error) {
      return await this.createNotificationLog({
        patientId: patient.id,
        notificationType: NotificationType.PREGNANCY_MILESTONE,
        messageContent: message,
        status: NotificationStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }

  private buildBookingConfirmationMessage(appointment: any): string {
    const date = format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy');
    const visitTypeLabels: Record<string, string> = {
      pregnancy_first_visit: 'Pregnancy First Visit',
      pregnancy_followup: 'Pregnancy Follow-up',
      ultrasound: 'Ultrasound',
      postpartum_normal: 'Postpartum Follow-up (Normal)',
      postpartum_csection: 'Postpartum Follow-up (C-section)',
      family_planning: 'Family Planning',
      infertility: 'Infertility Consultation',
      general_gyne: 'General Gynecology',
      pap_smear: 'Pap Smear',
      emergency: 'Emergency Visit',
    };

    return `✅ *Appointment Confirmed*

📅 *Date:* ${date}
🕐 *Time:* ${appointment.appointmentTime}
🏥 *Type:* ${visitTypeLabels[appointment.visitType] || appointment.visitType}
🔢 *Queue Number:* ${appointment.queueNumber || 'Will be assigned'}

⏰ *Please arrive 10-15 minutes before your appointment time.*

Thank you for choosing our clinic! We look forward to seeing you.`;
  }

  private buildReminderMessage(appointment: any, type: NotificationType): string {
    const date = format(new Date(appointment.appointmentDate), 'EEEE, MMMM dd, yyyy');
    let timeMessage = '';

    if (type === NotificationType.REMINDER_24H) {
      timeMessage = '24 hours';
    } else if (type === NotificationType.REMINDER_1H) {
      timeMessage = '1 hour';
    } else if (type === NotificationType.REMINDER_30M) {
      timeMessage = '30 minutes';
    }

    return `⏰ *Reminder: Your Appointment is in ${timeMessage}*

📅 *Date:* ${date}
🕐 *Time:* ${appointment.appointmentTime}
🔢 *Queue Number:* ${appointment.queueNumber || 'Will be assigned'}

Please be on time. We look forward to seeing you!`;
  }

  private async createNotificationLog(data: {
    patientId: string;
    appointmentId?: string;
    notificationType: NotificationType;
    messageContent: string;
    status: NotificationStatus;
    sentAt?: Date;
    errorMessage?: string;
  }): Promise<NotificationLog> {
    const log = this.notificationRepository.create({
      ...data,
      channel: NotificationChannel.TELEGRAM,
    });
    return await this.notificationRepository.save(log);
  }

  async getNotificationHistory(patientId: string): Promise<NotificationLog[]> {
    return await this.notificationRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}

