import { IsOptional, IsNumber, IsString, IsArray, IsDateString } from 'class-validator';

export class CreateGyneProfileDto {
  @IsOptional()
  @IsNumber()
  gravidity?: number;

  @IsOptional()
  @IsNumber()
  parity?: number;

  @IsOptional()
  @IsNumber()
  abortions?: number;

  @IsOptional()
  @IsArray()
  previousDeliveryTypes?: string[];

  @IsOptional()
  @IsDateString()
  lastDeliveryDate?: string;

  @IsOptional()
  @IsString()
  previousGynecologicalSurgeries?: string;

  @IsOptional()
  @IsArray()
  chronicDiseases?: string[];

  @IsOptional()
  @IsString()
  rhStatus?: string;

  @IsOptional()
  @IsString()
  currentFamilyPlanningMethod?: string;

  @IsOptional()
  @IsArray()
  previousFamilyPlanningMethods?: string[];

  @IsOptional()
  @IsString()
  otherRelevantNotes?: string;
}

