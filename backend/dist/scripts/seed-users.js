"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const auth_service_1 = require("../modules/auth/auth.service");
const user_entity_1 = require("../entities/user.entity");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const authService = app.get(auth_service_1.AuthService);
    console.log('🌱 Seeding default users...\n');
    const users = [
        {
            username: 'admin',
            email: 'admin@clinic.com',
            password: 'admin123',
            fullName: 'Admin User',
            role: user_entity_1.UserRole.ADMIN,
        },
        {
            username: 'reception',
            email: 'reception@clinic.com',
            password: 'reception123',
            fullName: 'Reception Staff',
            role: user_entity_1.UserRole.RECEPTION,
        },
        {
            username: 'doctor',
            email: 'doctor@clinic.com',
            password: 'doctor123',
            fullName: 'Dr. Smith',
            role: user_entity_1.UserRole.DOCTOR,
        },
    ];
    for (const userData of users) {
        try {
            const user = await authService.register(userData);
            console.log(`✅ Created user: ${user.username} (${user.role})`);
        }
        catch (error) {
            if (error.message?.includes('already exists')) {
                console.log(`⚠️  User ${userData.username} already exists`);
            }
            else {
                console.error(`❌ Error creating user ${userData.username}:`, error.message);
            }
        }
    }
    console.log('\n📝 Default Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('');
    console.log('Reception:');
    console.log('  Username: reception');
    console.log('  Password: reception123');
    console.log('');
    console.log('Doctor:');
    console.log('  Username: doctor');
    console.log('  Password: doctor123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed-users.js.map