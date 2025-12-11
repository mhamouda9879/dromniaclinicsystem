import { Module, forwardRef } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { ConversationService } from './conversation.service';
import { PatientsModule } from '../patients/patients.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    PatientsModule,
    AppointmentsModule,
    forwardRef(() => NotificationsModule),
    QueueModule,
  ],
  controllers: [TelegramController],
  providers: [TelegramService, ConversationService],
  exports: [TelegramService],
})
export class TelegramModule {}

