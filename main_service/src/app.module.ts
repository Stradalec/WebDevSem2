import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './user/userModule';
import { AuthorizationModule } from './authorization/authorizationModule';
import { CourseModule } from './course/courseModule';
import { LessonModule } from './lesson/lessonModule';
import { RedisModule } from './redis/redisModule';
import { KafkaModule } from './kafka/kafkaModule';
import { ImageModule } from './image/imageModule';
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), 
    MongooseModule.forRootAsync({ 
      imports: [ConfigModule], 
      inject: [ConfigService], 
      useFactory: (configService: ConfigService) => ({ 
        uri: configService.get<string>('MONGO_URL') }),
      }),
    UsersModule,
    AuthorizationModule,
    CourseModule,
    LessonModule,
    RedisModule,
    KafkaModule,
    ImageModule],
    
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule { }
