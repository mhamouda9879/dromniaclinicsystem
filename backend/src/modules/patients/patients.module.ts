import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { Patient } from '../../entities/patient.entity';
import { GyneProfile } from '../../entities/gyne-profile.entity';
import { Pregnancy } from '../../entities/pregnancy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, GyneProfile, Pregnancy])],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}

