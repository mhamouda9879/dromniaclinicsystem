import { Module, forwardRef } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
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
  controllers: [WhatsAppController],
  providers: [WhatsAppService, ConversationService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}

