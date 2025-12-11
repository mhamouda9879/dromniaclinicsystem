import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  appointmentId: string;

  @Column({ type: 'text', nullable: true })
  chiefComplaint: string;

  @Column({ type: 'text', nullable: true })
  subjectiveNotes: string;

  @Column({ type: 'text', nullable: true })
  examinationSummary: string;

  @Column({ type: 'jsonb', nullable: true })
  investigations: string[]; // ['lab_work', 'ultrasound', ...]

  @Column({ type: 'text', nullable: true })
  diagnosisSummary: string;

  @Column({ type: 'text', nullable: true })
  treatmentPlan: string;

  @Column({ type: 'jsonb', nullable: true })
  prescribedMedications: Record<string, any>[];

  @Column({ type: 'text', nullable: true })
  nextVisitRecommendation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Appointment, (appointment) => appointment.visit)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;
}

