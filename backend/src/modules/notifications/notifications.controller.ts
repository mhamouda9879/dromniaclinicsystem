import { Controller, Post, Get, Param, ParseUUIDPipe, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('booking-confirmation/:appointmentId')
  sendBookingConfirmation(@Param('appointmentId', ParseUUIDPipe) appointmentId: string) {
    return this.notificationsService.sendBookingConfirmation(appointmentId);
  }

  @Post('queue-update/:appointmentId')
  sendQueueUpdate(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Body() body: { queuePosition: number; estimatedWaitTime: number },
  ) {
    return this.notificationsService.sendQueueUpdate(
      appointmentId,
      body.queuePosition,
      body.estimatedWaitTime,
    );
  }

  @Post('thank-you/:appointmentId')
  sendThankYou(@Param('appointmentId', ParseUUIDPipe) appointmentId: string) {
    return this.notificationsService.sendThankYouMessage(appointmentId);
  }

  @Get('history/:patientId')
  getHistory(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.notificationsService.getNotificationHistory(patientId);
  }
}

