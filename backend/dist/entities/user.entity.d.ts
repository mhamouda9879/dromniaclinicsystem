export declare enum UserRole {
    ADMIN = "admin",
    RECEPTION = "reception",
    DOCTOR = "doctor"
}
export declare class User {
    id: string;
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
