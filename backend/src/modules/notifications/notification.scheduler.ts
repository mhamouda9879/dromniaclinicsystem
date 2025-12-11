import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { PatientsService } from '../patients/patients.service';
import { AppointmentStatus } from '../../entities/appointment.entity';
import { format, differenceInWeeks, addWeeks, addDays } from 'date-fns';

@Injectable()
export class NotificationScheduler {
  constructor(
    private notificationsService: NotificationsService,
    private appointmentsService: AppointmentsService,
    private patientsService: PatientsService,
  ) {}

  // Run every hour to check for 24-hour reminders
  @Cron(CronExpression.EVERY_HOUR)
  async handle24HourReminders() {
    console.log('Checking for 24-hour reminders...');
    await this.notificationsService.sendReminder24Hours();
  }

  // Run every 15 minutes to check for 1-hour reminders
  @Cron('*/15 * * * *')
  async handle1HourReminders() {
    console.log('Checking for 1-hour reminders...');
    await this.notificationsService.sendReminder1Hour();
  }

  // Run every 5 minutes to check for 30-minute reminders
  @Cron('*/5 * * * *')
  async handle30MinuteReminders() {
    console.log('Checking for 30-minute reminders...');
    await this.notificationsService.sendReminder30Minutes();
  }

  // Run daily at 9 AM to check for pregnancy milestone reminders
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handlePregnancyMilestones() {
    console.log('Checking for pregnancy milestone reminders...');
    
    // Get all patients with current pregnancies
    const patients = await this.patientsService.findAll();
    
    for (const patient of patients) {
      if (patient.pregnancies && patient.pregnancies.length > 0) {
        const currentPregnancy = patient.pregnancies.find(p => p.isCurrent);
        
        if (currentPregnancy && currentPregnancy.lmpDate) {
          const gestationWeeks = differenceInWeeks(new Date(), currentPregnancy.lmpDate);
          
          // Send reminders at key milestones
          if (gestationWeeks >= 11 && gestationWeeks <= 13) {
            // 12-week reminder
            await this.notificationsService.sendPregnancyMilestoneReminder(
              patient.id,
              `📅 *Pregnancy Milestone Reminder*

You are now around ${gestationWeeks} weeks pregnant. We recommend a follow-up pregnancy visit and possibly an ultrasound scan around this time.

If you haven't booked your appointment yet, you can easily book via WhatsApp by replying to this message with any number from the main menu.`,
            );
          } else if (gestationWeeks >= 19 && gestationWeeks <= 23) {
            // 20-22 week reminder for anomaly scan
            await this.notificationsService.sendPregnancyMilestoneReminder(
              patient.id,
              `📅 *Pregnancy Milestone Reminder*

You are now around ${gestationWeeks} weeks pregnant. This is an important time for an anomaly scan (detailed ultrasound) to check your baby's development.

If you haven't booked your scan yet, you can easily book via WhatsApp by replying to this message.`,
            );
          } else if (gestationWeeks >= 27 && gestationWeeks <= 29) {
            // 28-week reminder
            await this.notificationsService.sendPregnancyMilestoneReminder(
              patient.id,
              `📅 *Pregnancy Milestone Reminder*

You are now entering your third trimester (around ${gestationWeeks} weeks). Regular follow-up visits become more important during this period.

If you haven't booked your follow-up appointment yet, you can easily book via WhatsApp by replying to this message.`,
            );
          }
        }
      }
    }
  }

  // Check for postpartum reminders (2 weeks after delivery)
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handlePostpartumReminders() {
    console.log('Checking for postpartum reminders...');
    
    // This would need to query pregnancies with deliveryDate set
    // For now, this is a placeholder that can be enhanced
    // The logic would check if deliveryDate is around 2 weeks ago
    // and send a reminder for postpartum check and family planning discussion
  }
}

