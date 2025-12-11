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

export enum UserRole {
  ADMIN = 'admin',
  RECEPTION = 'reception',
  DOCTOR = 'doctor',
}

export interface Patient {
  id: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth?: string;
  firstVisitDate?: string;
  isReturningPatient: boolean;
  gyneProfile?: GyneProfile;
  pregnancies?: Pregnancy[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  visitType: VisitType;
  appointmentDate: string;
  appointmentTime: string;
  queueNumber?: number;
  status: AppointmentStatus;
  emergencyFlag: boolean;
  source: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GyneProfile {
  id: string;
  patientId: string;
  gravidity?: number;
  parity?: number;
  abortions?: number;
  previousDeliveryTypes?: string[];
  lastDeliveryDate?: string;
  currentFamilyPlanningMethod?: string;
}

export interface Pregnancy {
  id: string;
  patientId: string;
  lmpDate?: string;
  eddDate?: string;
  currentGestationWeeks?: number;
  highRiskFlag: boolean;
  isCurrent: boolean;
}

export interface Visit {
  id: string;
  appointmentId: string;
  chiefComplaint?: string;
  subjectiveNotes?: string;
  examinationSummary?: string;
  investigations?: string[];
  diagnosisSummary?: string;
  treatmentPlan?: string;
  prescribedMedications?: any[];
  nextVisitRecommendation?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: UserRole;
}

export interface QueueDisplay {
  currentNumber: number | null;
  nextNumber: number | null;
  currentPatient: string | null;
  nextPatient: string | null;
}

