import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Course, CourseDocument } from "../course/schemas/course.schema";
import { Lesson, LessonDocument } from "../lesson/schemas/lesson.schema";
import { AuthUser } from "../course/authUser";
import { KafkaService } from "../kafka/kafkaService";
import { RedisService } from "../redis/redisService";
import { Multer } from "multer";
import { ImageStatus } from "../common_schemas/image.schema";
import { UserRole } from "../user/schemas/user.schema";
@Injectable()
export class ImageService{
    constructor(
        @InjectModel(Course.name)
        private readonly courseModel: Model<CourseDocument>,
        @InjectModel(Lesson.name)
        private readonly lessonModel: Model<LessonDocument>,
        private readonly kafkaService: KafkaService,
        private readonly redisService: RedisService
    ){}

    async uploadCourseCover(courseId: string, file: Express.Multer.File, user: AuthUser){
        if (!file) {
            throw new NotFoundException("File not found");
        }
        const course = await this.courseModel.findById(courseId);
        if (!course) {
           throw new NotFoundException('Course not found');
        }

        this.ensureTeacherOwner(course.teacher.toString(), user)
        course.cover = { url: file.filename, status: ImageStatus.PROCESSING}
        await course.save()
        await this.redisService.del('courses:list', `course:${courseId}`);
        await this.kafkaService.sendImageUploaded({entityType: "course", entityId: courseId, originalPath: file.path, filename: file.filename});
        return{ uploaded: true, entityType: "course", entityId: courseId, filename: file.filename, status: ImageStatus.PROCESSING}
    }
    
    async uploadLessonImage(lessonId: string, file: Express.Multer.File, user: AuthUser) {
        if (!file) {
            throw new NotFoundException('File not found');
        }

        const lesson = await this.lessonModel.findById(lessonId);

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }   

        const course = await this.courseModel.findById(lesson.course);

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        this.ensureTeacherOwner(course.teacher.toString(), user);

        lesson.images.push({url: file.filename,status: ImageStatus.PROCESSING});

        await lesson.save();

        await this.redisService.del('courses:list', `course:${course._id.toString()}`);

        await this.kafkaService.sendImageUploaded({entityType: 'lesson', entityId: lessonId, originalPath: file.path, filename: file.filename,});

    return {uploaded: true, entityType: 'lesson', entityId: lessonId, filename: file.filename,status: ImageStatus.PROCESSING};
  }

    private ensureTeacherOwner(ownerId: string, user: AuthUser) {
        if (user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('Only teachers can upload images');
        }

        if (ownerId !== user.userId) {
            throw new ForbiddenException('Only owner can upload images');
        }
    }
    
}