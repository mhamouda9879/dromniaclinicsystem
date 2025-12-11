import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '../../entities/appointment.entity';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(createAppointmentDto: CreateAppointmentDto): Promise<import("../../entities/appointment.entity").Appointment>;
    findAll(date?: string): Promise<import("../../entities/appointment.entity").Appointment[]>;
    findToday(): Promise<import("../../entities/appointment.entity").Appointment[]>;
    getAvailableSlots(date: string): Promise<string[]>;
    getAvailableDates(): Promise<Date[]>;
    findByPatient(patientId: string): Promise<import("../../entities/appointment.entity").Appointment[]>;
    findOne(id: string): Promise<import("../../entities/appointment.entity").Appointment>;
    update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<import("../../entities/appointment.entity").Appointment>;
    updateStatus(id: string, status: AppointmentStatus): Promise<import("../../entities/appointment.entity").Appointment>;
    cancel(id: string): Promise<import("../../entities/appointment.entity").Appointment>;
}
