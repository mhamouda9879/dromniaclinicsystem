import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsUUID,
  IsObject,
} from 'class-validator';
import { VisitType, AppointmentStatus, AppointmentSource } from '../../../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsEnum(VisitType)
  visitType: VisitType;

  @IsDateString()
  appointmentDate: string;

  @IsString()
  appointmentTime: string;

  @IsOptional()
  @IsNumber()
  queueNumber?: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsBoolean()
  emergencyFlag?: boolean;

  @IsOptional()
  @IsEnum(AppointmentSource)
  source?: AppointmentSource;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  bookingData?: Record<string, any>;
}

