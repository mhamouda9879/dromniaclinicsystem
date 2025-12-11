import { GyneProfile } from './gyne-profile.entity';
import { Appointment } from './appointment.entity';
import { Pregnancy } from './pregnancy.entity';
export declare class Patient {
    id: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: Date;
    firstVisitDate: Date;
    generalNotes: string;
    isReturningPatient: boolean;
    whatsappId: string;
    telegramChatId: number;
    telegramUsername: string;
    createdAt: Date;
    updatedAt: Date;
    gyneProfile: GyneProfile;
    appointments: Appointment[];
    pregnancies: Pregnancy[];
}
