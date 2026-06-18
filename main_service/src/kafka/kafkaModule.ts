import { Module } from '@nestjs/common';
import { KafkaService } from './kafkaService';

@Module({
    providers: [KafkaService],
    exports: [KafkaService],
})
export class KafkaModule { }