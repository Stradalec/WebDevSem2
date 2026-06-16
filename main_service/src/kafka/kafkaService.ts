import {Injectable,Logger,OnModuleDestroy,OnModuleInit,} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

export type ImageUploadedPayload = {
  entityType: 'course' | 'lesson';
  entityId: string;
  originalPath: string;
  filename: string;
};

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor(private readonly configService: ConfigService) {
    const broker =
      this.configService.get<string>('KAFKA_BROKER') ?? 'localhost:9092';

    this.kafka = new Kafka({
      clientId: 'main-api',
      brokers: [broker],
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka producer disconnected');
  }

  async sendImageUploaded(payload: ImageUploadedPayload): Promise<void> {
    await this.producer.send({
      topic: 'image.uploaded',
      messages: [
        {
          key: `${payload.entityType}:${payload.entityId}`,
          value: JSON.stringify(payload),
        },
      ],
    });

    this.logger.log(
      `Sent image.uploaded event for ${payload.entityType}:${payload.entityId}`,
    );
  }
}