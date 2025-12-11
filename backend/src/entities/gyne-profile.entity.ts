import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

@Entity('gyne_profiles')
export class GyneProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patientId: string;

  @Column({ type: 'integer', nullable: true })
  gravidity: number; // G - number of pregnancies

  @Column({ type: 'integer', nullable: true })
  parity: number; // P - number of deliveries > 20 weeks

  @Column({ type: 'integer', nullable: true, default: 0 })
  abortions: number; // A - number of abortions/miscarriages

  @Column({ type: 'jsonb', nullable: true })
  previousDeliveryTypes: string[]; // ['normal', 'c-section', ...]

  @Column({ type: 'date', nullable: true })
  lastDeliveryDate: Date;

  @Column({ type: 'text', nullable: true })
  previousGynecologicalSurgeries: string;

  @Column({ type: 'jsonb', nullable: true })
  chronicDiseases: string[]; // ['hypertension', 'diabetes', ...]

  @Column({ type: 'varchar', length: 10, nullable: true })
  rhStatus: string; // Rh+ or Rh-

  @Column({ type: 'varchar', length: 100, nullable: true })
  currentFamilyPlanningMethod: string;

  @Column({ type: 'jsonb', nullable: true })
  previousFamilyPlanningMethods: string[];

  @Column({ type: 'text', nullable: true })
  otherRelevantNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Patient, (patient) => patient.gyneProfile)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;
}

