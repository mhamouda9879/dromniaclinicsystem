import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationScheduler } from './notification.scheduler';
import { NotificationLog } from '../../entities/notification-log.entity';
import { AppointmentsModule } from '../appointments/appointments.module';
import { TelegramModule } from '../telegram/telegram.module';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationLog]),
    AppointmentsModule,
    forwardRef(() => TelegramModule),
    PatientsModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationScheduler],
  exports: [NotificationsService],
})
export class NotificationsModule {}

