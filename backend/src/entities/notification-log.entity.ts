import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Appointment } from './appointment.entity';

export enum NotificationType {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  REMINDER_24H = 'reminder_24h',
  REMINDER_1H = 'reminder_1h',
  REMINDER_30M = 'reminder_30m',
  QUEUE_UPDATE = 'queue_update',
  THANK_YOU = 'thank_you',
  FEEDBACK_REQUEST = 'feedback_request',
  PREGNANCY_MILESTONE = 'pregnancy_milestone',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
}

export enum NotificationChannel {
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  SMS = 'sms',
  EMAIL = 'email',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('notification_logs')
@Index(['patientId', 'createdAt'])
@Index(['status', 'createdAt'])
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patientId: string;

  @Column({ type: 'uuid', nullable: true })
  appointmentId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  notificationType: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.TELEGRAM,
  })
  channel: NotificationChannel;

  @Column({ type: 'varchar', length: 255, nullable: true })
  messageTemplateKey: string;

  @Column({ type: 'text', nullable: true })
  messageContent: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;
}

