import { Patient } from './patient.entity';
export declare class Pregnancy {
    id: string;
    patientId: string;
    lmpDate: Date;
    eddDate: Date;
    currentGestationWeeks: number;
    highRiskFlag: boolean;
    isCurrent: boolean;
    deliveryDate: Date;
    deliveryType: string;
    createdAt: Date;
    updatedAt: Date;
    patient: Patient;
}
