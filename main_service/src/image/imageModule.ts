import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Course, CourseSchema } from "../course/schemas/course.schema";
import { Lesson, LessonSchema } from "../lesson/schemas/lesson.schema";
import { RedisModule } from "../redis/redisModule";
import { KafkaModule } from "../kafka/kafkaModule";
import { ImageService } from "./imageService";
import { ImageController } from "./ImageController";

@Module({
  imports: [MongooseModule.forFeature([
    {name: Course.name, schema: CourseSchema},
    {name: Lesson.name, schema: LessonSchema}
  ]),
    RedisModule,
    KafkaModule], 
  controllers: [ImageController],
  providers: [ImageService],

})
export class ImageModule { }