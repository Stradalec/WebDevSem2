import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { KafkaService } from './kafka/kafkaService';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly  kafkaService: KafkaService) {}
  @Post('test-kafka')
  async testKafka() {
    await this.kafkaService.sendImageUploaded({
      entityType: 'course',
      entityId: 'test-course-id',
      originalPath: 'uploads/originals/test.jpg',
      filename: 'test.jpg',
    });

    return {
      sent: true,
    };
  }
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
