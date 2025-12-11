import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../../entities/appointment.entity';
import { AppointmentsService } from '../appointments/appointments.service';
import { format } from 'date-fns';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private appointmentsService: AppointmentsService,
  ) {}

  async getTodayQueue(): Promise<Appointment[]> {
    const appointments = await this.appointmentsService.findToday();
    
    // Sort by: emergency first, then by queue number
    return appointments
      .filter((apt) => 
        apt.status !== AppointmentStatus.CANCELLED && 
        apt.status !== AppointmentStatus.FINISHED &&
        apt.status !== AppointmentStatus.NO_SHOW
      )
      .sort((a, b) => {
        // Emergency cases first
        if (a.emergencyFlag && !b.emergencyFlag) return -1;
        if (!a.emergencyFlag && b.emergencyFlag) return 1;
        // Then by queue number
        return (a.queueNumber || 0) - (b.queueNumber || 0);
      });
  }

  async getCurrentPatient(): Promise<Appointment | null> {
    const queue = await this.getTodayQueue();
    return queue.find(
      (apt) => apt.status === AppointmentStatus.WITH_DOCTOR,
    ) || null;
  }

  async getNextPatient(): Promise<Appointment | null> {
    const queue = await this.getTodayQueue();
    return queue.find(
      (apt) => apt.status === AppointmentStatus.ARRIVED,
    ) || null;
  }

  async getQueuePosition(patientId: string): Promise<number | null> {
    const queue = await this.getTodayQueue();
    const index = queue.findIndex((apt) => apt.patientId === patientId);
    return index >= 0 ? index + 1 : null;
  }

  async getEstimatedWaitTime(queuePosition: number): Promise<number> {
    // Estimate: average 15 minutes per patient
    const averageConsultationTime = 15;
    return (queuePosition - 1) * averageConsultationTime;
  }

  async markAsArrived(appointmentId: string): Promise<Appointment> {
    return await this.appointmentsService.updateStatus(
      appointmentId,
      AppointmentStatus.ARRIVED,
    );
  }

  async startConsultation(appointmentId: string): Promise<Appointment> {
    return await this.appointmentsService.updateStatus(
      appointmentId,
      AppointmentStatus.WITH_DOCTOR,
    );
  }

  async finishConsultation(appointmentId: string): Promise<Appointment> {
    return await this.appointmentsService.updateStatus(
      appointmentId,
      AppointmentStatus.FINISHED,
    );
  }

  async reorderQueue(
    appointmentId: string,
    newQueueNumber: number,
  ): Promise<Appointment> {
    const appointment = await this.appointmentsService.findOne(appointmentId);
    appointment.queueNumber = newQueueNumber;
    return await this.appointmentRepository.save(appointment);
  }

  async getWaitingRoomDisplay(): Promise<{
    currentNumber: number | null;
    nextNumber: number | null;
    currentPatient: string | null;
    nextPatient: string | null;
  }> {
    const current = await this.getCurrentPatient();
    const next = await this.getNextPatient();

    const anonymizeName = (name: string): string => {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}. ${parts[parts.length - 1]}`;
      }
      return name.substring(0, 2) + '***';
    };

    return {
      currentNumber: current?.queueNumber || null,
      nextNumber: next?.queueNumber || null,
      currentPatient: current ? anonymizeName(current.patient.fullName) : null,
      nextPatient: next ? anonymizeName(next.patient.fullName) : null,
    };
  }
}

