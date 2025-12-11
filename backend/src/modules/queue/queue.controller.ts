import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('today')
  getTodayQueue() {
    return this.queueService.getTodayQueue();
  }

  @Get('current')
  getCurrentPatient() {
    return this.queueService.getCurrentPatient();
  }

  @Get('next')
  getNextPatient() {
    return this.queueService.getNextPatient();
  }

  @Get('position/:patientId')
  getQueuePosition(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.queueService.getQueuePosition(patientId);
  }

  @Get('waiting-room')
  getWaitingRoomDisplay() {
    return this.queueService.getWaitingRoomDisplay();
  }

  @Patch(':id/arrived')
  markAsArrived(@Param('id', ParseUUIDPipe) id: string) {
    return this.queueService.markAsArrived(id);
  }

  @Patch(':id/start')
  startConsultation(@Param('id', ParseUUIDPipe) id: string) {
    return this.queueService.startConsultation(id);
  }

  @Patch(':id/finish')
  finishConsultation(@Param('id', ParseUUIDPipe) id: string) {
    return this.queueService.finishConsultation(id);
  }

  @Patch(':id/reorder')
  reorderQueue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('queueNumber') queueNumber: number,
  ) {
    return this.queueService.reorderQueue(id, queueNumber);
  }
}

