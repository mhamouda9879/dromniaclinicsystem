import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../../entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PatientsService } from '../patients/patients.service';
export declare class AppointmentsService {
    private appointmentRepository;
    private patientsService;
    constructor(appointmentRepository: Repository<Appointment>, patientsService: PatientsService);
    create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment>;
    findAll(): Promise<Appointment[]>;
    findByDate(date: string): Promise<Appointment[]>;
    findToday(): Promise<Appointment[]>;
    findOne(id: string): Promise<Appointment>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment>;
    updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
    cancel(id: string): Promise<Appointment>;
    getAvailableTimeSlots(date: string): Promise<string[]>;
    getAvailableDates(startDate?: Date): Promise<Date[]>;
    private getNextQueueNumber;
    findByPatient(patientId: string): Promise<Appointment[]>;
    findByStatusAndDate(status: AppointmentStatus, date: string): Promise<Appointment[]>;
}
