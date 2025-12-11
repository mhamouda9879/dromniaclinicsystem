import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'OB/GYN Clinic Booking System API';
  }
}

