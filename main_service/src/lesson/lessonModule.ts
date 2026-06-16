import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import { LessonController } from './lessonController';
import { LessonService } from './lessonService';
import { RedisModule } from '../redis/redisModule';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lesson.name, schema: LessonSchema },
      { name: Course.name, schema: CourseSchema }
    ]),
  RedisModule],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [MongooseModule, LessonService],
})
export class LessonModule {}