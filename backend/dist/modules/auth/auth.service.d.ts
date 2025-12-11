import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../../entities/user.entity';
export interface LoginDto {
    username: string;
    password: string;
}
export interface RegisterDto {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    role: UserRole;
}
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            email: any;
            fullName: any;
            role: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        username: string;
        email: string;
        fullName: string;
        role: UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        username: string;
        email: string;
        fullName: string;
        role: UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
