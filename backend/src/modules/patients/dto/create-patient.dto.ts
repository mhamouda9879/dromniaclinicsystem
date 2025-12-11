import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsBoolean()
  isReturningPatient?: boolean;

  @IsOptional()
  @IsString()
  whatsappId?: string;

  @IsOptional()
  telegramChatId?: number;

  @IsOptional()
  @IsString()
  telegramUsername?: string;

  @IsOptional()
  @IsString()
  generalNotes?: string;
}

