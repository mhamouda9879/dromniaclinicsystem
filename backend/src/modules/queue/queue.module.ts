import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { Appointment } from '../../entities/appointment.entity';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), AppointmentsModule],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}

