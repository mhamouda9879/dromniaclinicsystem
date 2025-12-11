import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../modules/auth/auth.service';
import { UserRole } from '../entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  console.log('🌱 Seeding default users...\n');

  const users = [
    {
      username: 'admin',
      email: 'admin@clinic.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: UserRole.ADMIN,
    },
    {
      username: 'reception',
      email: 'reception@clinic.com',
      password: 'reception123',
      fullName: 'Reception Staff',
      role: UserRole.RECEPTION,
    },
    {
      username: 'doctor',
      email: 'doctor@clinic.com',
      password: 'doctor123',
      fullName: 'Dr. Smith',
      role: UserRole.DOCTOR,
    },
  ];

  for (const userData of users) {
    try {
      const user = await authService.register(userData);
      console.log(`✅ Created user: ${user.username} (${user.role})`);
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log(`⚠️  User ${userData.username} already exists`);
      } else {
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

