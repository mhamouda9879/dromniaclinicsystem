import { Patient } from './patient.entity';
export declare class GyneProfile {
    id: string;
    patientId: string;
    gravidity: number;
    parity: number;
    abortions: number;
    previousDeliveryTypes: string[];
    lastDeliveryDate: Date;
    previousGynecologicalSurgeries: string;
    chronicDiseases: string[];
    rhStatus: string;
    currentFamilyPlanningMethod: string;
    previousFamilyPlanningMethods: string[];
    otherRelevantNotes: string;
    createdAt: Date;
    updatedAt: Date;
    patient: Patient;
}
