import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/course.schema';
import { CourseController } from './courseController';
import { CourseService } from './courseService';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: User.name, schema: UserSchema}
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [MongooseModule, CourseModule],
})
export class CourseModule {}