import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VisitsService, CreateVisitDto, UpdateVisitDto } from './visits.service';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  create(@Body() createVisitDto: CreateVisitDto) {
    return this.visitsService.create(createVisitDto);
  }

  @Get('appointment/:appointmentId')
  findByAppointment(@Param('appointmentId', ParseUUIDPipe) appointmentId: string) {
    return this.visitsService.findByAppointment(appointmentId);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.visitsService.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.visitsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVisitDto: UpdateVisitDto,
  ) {
    return this.visitsService.update(id, updateVisitDto);
  }
}

