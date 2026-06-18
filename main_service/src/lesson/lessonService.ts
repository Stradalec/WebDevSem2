import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import { Course, CourseDocument } from '../course/schemas/course.schema';
import { UserRole } from '../user/schemas/user.schema';
import { CreateLessonDto } from './dto/createLesson.dto';
import { UpdateLessonDto } from './dto/updateLesson.dto';
import { AuthUser } from '../course/authUser';
import { RedisService } from '../redis/redisService';

@Injectable()
export class LessonService {
    constructor(
        @InjectModel(Lesson.name)
        private readonly lessonModel: Model<LessonDocument>,

        @InjectModel(Course.name)
        private readonly courseModel: Model<CourseDocument>,
        private readonly redisService: RedisService
    ) { }

    async findByCourse(courseId: string) {
        const course = await this.courseModel.findById(courseId);

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        return this.lessonModel
            .find({ course: course._id })
            .sort({ order: 1 });
    }

    async create(courseId: string, dto: CreateLessonDto, user: AuthUser) {
        const course = await this.courseModel.findById(courseId);

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        this.ensureTeacherOwner(course, user);

        const lesson = await this.lessonModel.create({
            name: dto.name,
            textContent: dto.textContent,
            order: dto.order,
            course: course._id,
            images: [],
        });

        course.lessons.push(lesson._id as Types.ObjectId);
        await course.save();
        await this.invalidateCourseCache(course._id.toString());
        return lesson;
    }

    async update(courseId: string, lessonId: string, dto: UpdateLessonDto, user: AuthUser) {
        const course = await this.courseModel.findById(courseId);

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        this.ensureTeacherOwner(course, user);

        const lesson = await this.lessonModel.findOne({ _id: lessonId, course: course._id });

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        if (dto.name !== undefined) {
            lesson.name = dto.name;
        }

        if (dto.textContent !== undefined) {
            lesson.textContent = dto.textContent;
        }

        if (dto.order !== undefined) {
            lesson.order = dto.order;
        }
        const savedLesson = await lesson.save();
        await this.invalidateCourseCache(course._id.toString());
        return savedLesson;
    }

    async remove(courseId: string, lessonId: string, user: AuthUser) {
        const course = await this.courseModel.findById(courseId);

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        this.ensureTeacherOwner(course, user);

        const lesson = await this.lessonModel.findOne({ _id: lessonId, course: course._id });

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        await lesson.deleteOne();

        course.lessons = course.lessons.filter(
            (id) => id.toString() !== lessonId,
        );

        await course.save();
        await this.invalidateCourseCache(course._id.toString());
        return { deleted: true, lessonId };
    }

    private ensureTeacherOwner(course: CourseDocument, user: AuthUser) {
        if (user.role !== UserRole.TEACHER) {
            throw new ForbiddenException('Only teachers can modify lessons');
        }

        if (course.teacher.toString() !== user.userId) {
            throw new ForbiddenException('Only course owner can modify lessons');
        }
    }
    private async invalidateCourseCache(courseId: string) {
        await this.redisService.del('courses:list', `course:${courseId}`);
    }
}