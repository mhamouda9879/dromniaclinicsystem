import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { GyneProfile } from './gyne-profile.entity';
import { Appointment } from './appointment.entity';
import { Pregnancy } from './pregnancy.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'date', nullable: true })
  firstVisitDate: Date;

  @Column({ type: 'text', nullable: true })
  generalNotes: string;

  @Column({ type: 'boolean', default: false })
  isReturningPatient: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  whatsappId: string;

  @Column({ type: 'bigint', nullable: true, unique: true })
  telegramChatId: number; // Telegram chat ID (can be very large number)

  @Column({ type: 'varchar', length: 100, nullable: true })
  telegramUsername: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => GyneProfile, (profile) => profile.patient, { cascade: true })
  gyneProfile: GyneProfile;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @OneToMany(() => Pregnancy, (pregnancy) => pregnancy.patient)
  pregnancies: Pregnancy[];
}

