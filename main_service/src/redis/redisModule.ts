import { Module } from '@nestjs/common';
import { RedisService } from './redisService';

@Module({
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisModule { }