import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '../../entities/appointment.entity';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  findAll(@Query('date') date?: string) {
    if (date) {
      return this.appointmentsService.findByDate(date);
    }
    return this.appointmentsService.findAll();
  }

  @Get('today')
  findToday() {
    return this.appointmentsService.findToday();
  }

  @Get('available-slots')
  getAvailableSlots(@Query('date') date: string) {
    return this.appointmentsService.getAvailableTimeSlots(date);
  }

  @Get('available-dates')
  getAvailableDates() {
    return this.appointmentsService.getAvailableDates();
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.appointmentsService.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: AppointmentStatus,
  ) {
    return this.appointmentsService.updateStatus(id, status);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.cancel(id);
  }
}

