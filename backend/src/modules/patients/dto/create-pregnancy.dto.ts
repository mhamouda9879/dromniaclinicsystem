import { IsOptional, IsDateString, IsNumber, IsBoolean } from 'class-validator';

export class CreatePregnancyDto {
  @IsOptional()
  @IsDateString()
  lmpDate?: string;

  @IsOptional()
  @IsDateString()
  eddDate?: string;

  @IsOptional()
  @IsNumber()
  currentGestationWeeks?: number;

  @IsOptional()
  @IsBoolean()
  highRiskFlag?: boolean;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

