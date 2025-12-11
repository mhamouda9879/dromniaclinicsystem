import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { Visit } from '../../entities/visit.entity';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Visit]), AppointmentsModule],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService],
})
export class VisitsModule {}

