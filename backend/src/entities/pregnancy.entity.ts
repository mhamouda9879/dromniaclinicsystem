import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

@Entity('pregnancies')
export class Pregnancy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patientId: string;

  @Column({ type: 'date', nullable: true })
  lmpDate: Date; // Last Menstrual Period

  @Column({ type: 'date', nullable: true })
  eddDate: Date; // Estimated Date of Delivery

  @Column({ type: 'integer', nullable: true })
  currentGestationWeeks: number;

  @Column({ type: 'boolean', default: false })
  highRiskFlag: boolean;

  @Column({ type: 'boolean', default: false })
  isCurrent: boolean; // Is this the current/active pregnancy

  @Column({ type: 'date', nullable: true })
  deliveryDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deliveryType: string; // 'normal', 'c-section', etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.pregnancies)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;
}

