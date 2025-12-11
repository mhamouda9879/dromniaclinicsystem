import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateGyneProfileDto } from './dto/create-gyne-profile.dto';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.findOne(id);
  }

  @Get('phone/:phoneNumber')
  async findByPhone(@Param('phoneNumber') phoneNumber: string) {
    const patient = await this.patientsService.findByPhoneNumber(phoneNumber);
    if (!patient) {
      throw new NotFoundException(`Patient with phone number ${phoneNumber} not found`);
    }
    return patient;
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Post(':id/gyne-profile')
  createGyneProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() profileDto: CreateGyneProfileDto,
  ) {
    return this.patientsService.createOrUpdateGyneProfile(id, profileDto);
  }

  @Post(':id/pregnancies')
  createPregnancy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() pregnancyDto: CreatePregnancyDto,
  ) {
    return this.patientsService.createPregnancy(id, pregnancyDto);
  }

  @Get(':id/current-pregnancy')
  getCurrentPregnancy(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.getCurrentPregnancy(id);
  }
}

