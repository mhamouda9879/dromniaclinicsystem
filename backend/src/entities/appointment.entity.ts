import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Visit } from './visit.entity';

export enum VisitType {
  PREGNANCY_FIRST_VISIT = 'pregnancy_first_visit',
  PREGNANCY_FOLLOWUP = 'pregnancy_followup',
  ULTRASOUND = 'ultrasound',
  POSTPARTUM_NORMAL = 'postpartum_normal',
  POSTPARTUM_CSECTION = 'postpartum_csection',
  FAMILY_PLANNING = 'family_planning',
  INFERTILITY = 'infertility',
  GENERAL_GYNE = 'general_gyne',
  PAP_SMEAR = 'pap_smear',
  EMERGENCY = 'emergency',
}

export enum AppointmentStatus {
  BOOKED = 'booked',
  CONFIRMED = 'confirmed',
  ARRIVED = 'arrived',
  WITH_DOCTOR = 'with_doctor',
  FINISHED = 'finished',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled',
}

export enum AppointmentSource {
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  WALK_IN = 'walk_in',
  PHONE = 'phone',
  OTHER = 'other',
}

@Entity('appointments')
@Index(['appointmentDate', 'appointmentTime'])
@Index(['status', 'appointmentDate'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patientId: string;

  @Column({
    type: 'enum',
    enum: VisitType,
  })
  visitType: VisitType;

  @Column({ type: 'date' })
  appointmentDate: Date;

  @Column({ type: 'time' })
  appointmentTime: string;

  @Column({ type: 'integer', nullable: true })
  queueNumber: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.BOOKED,
  })
  status: AppointmentStatus;

  @Column({ type: 'boolean', default: false })
  emergencyFlag: boolean;

  @Column({
    type: 'enum',
    enum: AppointmentSource,
    default: AppointmentSource.TELEGRAM,
  })
  source: AppointmentSource;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  bookingData: Record<string, any>; // Store WhatsApp conversation data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @OneToOne(() => Visit, (visit) => visit.appointment)
  visit: Visit;
}

