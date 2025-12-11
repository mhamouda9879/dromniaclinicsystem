import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Appointment, VisitType, AppointmentStatus } from '../../entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PatientsService } from '../patients/patients.service';
import { format, addDays, isBefore, parse } from 'date-fns';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private patientsService: PatientsService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { patientId, ...appointmentData } = createAppointmentDto;
    
    // Verify patient exists
    await this.patientsService.findOne(patientId);

    // Generate queue number if not provided
    if (!appointmentData.queueNumber) {
      const dateForQueue = typeof appointmentData.appointmentDate === 'string'
        ? new Date(appointmentData.appointmentDate)
        : appointmentData.appointmentDate;
      appointmentData.queueNumber = await this.getNextQueueNumber(
        dateForQueue,
      );
    }

    const appointment = this.appointmentRepository.create({
      ...appointmentData,
      patientId,
    });

    return await this.appointmentRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      relations: ['patient'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' },
    });
  }

  async findByDate(date: string): Promise<Appointment[]> {
    const appointmentDate = new Date(date);
    return await this.appointmentRepository.find({
      where: {
        appointmentDate: Between(
          new Date(appointmentDate.setHours(0, 0, 0, 0)),
          new Date(appointmentDate.setHours(23, 59, 59, 999)),
        ),
      },
      relations: ['patient'],
      order: { appointmentTime: 'ASC', queueNumber: 'ASC' },
    });
  }

  async findToday(): Promise<Appointment[]> {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.findByDate(today);
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'visit'],
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, updateAppointmentDto);
    return await this.appointmentRepository.save(appointment);
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = status;
    return await this.appointmentRepository.save(appointment);
  }

  async cancel(id: string): Promise<Appointment> {
    return this.updateStatus(id, AppointmentStatus.CANCELLED);
  }

  async getAvailableTimeSlots(date: string): Promise<string[]> {
    // Simple implementation - can be enhanced with business logic
    const slots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30',
    ];

    const appointments = await this.findByDate(date);
    const bookedSlots = appointments
      .filter((apt) => apt.status !== AppointmentStatus.CANCELLED)
      .map((apt) => apt.appointmentTime);

    return slots.filter((slot) => !bookedSlots.includes(slot));
  }

  async getAvailableDates(startDate?: Date): Promise<Date[]> {
    const start = startDate || new Date();
    const end = addDays(start, 30); // Next 30 days
    const dates: Date[] = [];

    for (let date = new Date(start); date <= end; date = addDays(date, 1)) {
      // Skip weekends (can be customized)
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(date));
      }
    }

    return dates;
  }

  private async getNextQueueNumber(date: Date): Promise<number> {
    const appointments = await this.findByDate(format(date, 'yyyy-MM-dd'));
    if (appointments.length === 0) {
      return 1;
    }
    const maxQueueNumber = Math.max(
      ...appointments.map((apt) => apt.queueNumber || 0),
    );
    return maxQueueNumber + 1;
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: { patientId },
      relations: ['patient'],
      order: { appointmentDate: 'DESC', appointmentTime: 'DESC' },
    });
  }

  async findByStatusAndDate(
    status: AppointmentStatus,
    date: string,
  ): Promise<Appointment[]> {
    const appointmentDate = new Date(date);
    return await this.appointmentRepository.find({
      where: {
        status,
        appointmentDate: Between(
          new Date(appointmentDate.setHours(0, 0, 0, 0)),
          new Date(appointmentDate.setHours(23, 59, 59, 999)),
        ),
      },
      relations: ['patient'],
      order: { queueNumber: 'ASC' },
    });
  }
}

