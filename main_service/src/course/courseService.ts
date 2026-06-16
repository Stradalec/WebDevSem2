import { BadRequestException, ForbiddenException,Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { User, UserDocument, UserRole } from '../user/schemas/user.schema';
import { CreateCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { AuthUser } from './authUser';
import { RedisService } from '../redis/redisService';


@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    private readonly redisService: RedisService
  ) {}

  async findAll() {
    const cacheKey = 'courses:list';
    const cachedCourses = await this.redisService.get(cacheKey);
    if (cachedCourses){
        return cachedCourses;
    }
    const courses = await this.courseModel.find().populate("teacher", "name email role").sort({createdAt: -1}).lean();
    await this.redisService.set(cacheKey, courses, 60);
    return courses;
  }

  async findOne(id: string) {
    const cacheKey = `course:${id}`;

    const cachedCourse = await this.redisService.get(cacheKey);
    if (cachedCourse){
        return cachedCourse;
    }
    const course = await this.courseModel.findById(id).populate("teacher", "name email role").populate("lessons").lean();
    if  (!course){
        throw new NotFoundException("Course not found");
    }
    await this.redisService.set(cacheKey, course, 60);
    return course;
  }

  async create(dto: CreateCourseDto, user: AuthUser) {
    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Only teachers can create courses');
    }

    const course = await this.courseModel.create({
      name: dto.name,
      description: dto.description,
      teacher: new Types.ObjectId(user.userId),
      lessons: [],
      students: [],
      studentsCount: 0,
    });
    
    await this.invalidateCourseCache();
    return course;
  }

  async update(id: string, dto: UpdateCourseDto, user: AuthUser) {
    const course = await this.courseModel.findById(id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    this.ensureTeacherOwner(course, user);

    if (dto.name !== undefined) {
      course.name = dto.name;
    }

    if (dto.description !== undefined) {
      course.description = dto.description;
    }
    const savedCourse = await course.save();
    await this.invalidateCourseCache(id);

    return savedCourse;
  }

  async remove(id: string, user: AuthUser) {
    const course = await this.courseModel.findById(id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    this.ensureTeacherOwner(course, user);

    await course.deleteOne();

    await this.invalidateCourseCache(id);

    return {
      deleted: true,
      courseId: id,
    };
  }

  async enroll(id: string, user: AuthUser) {
    if (user.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Only students can enroll in courses');
    }

    const course = await this.courseModel.findById(id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const studentObjectId = new Types.ObjectId(user.userId);

    const alreadyEnrolled = course.students.some(
      (studentId) => studentId.toString() === user.userId,
    );

    if (alreadyEnrolled) {
      throw new BadRequestException('Student already enrolled in this course');
    }

    const student = await this.userModel.findById(user.userId);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    course.students.push(studentObjectId);
    course.studentsCount = course.students.length;

    student.enrolledCourses.push(course._id as Types.ObjectId);

    await course.save();
    await student.save();

    await this.invalidateCourseCache(id);
    
    return {
      enrolled: true,
      courseId: course._id,
      studentId: student._id,
    };
  }

  private ensureTeacherOwner(course: CourseDocument, user: AuthUser) {
    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Only teachers can modify courses');
    }

    if (course.teacher.toString() !== user.userId) {
      throw new ForbiddenException('Only course owner can modify this course');
    }
  }
  private async invalidateCourseCache(courseId?: string) {
    const keys = ['courses:list'];

    if (courseId) {
      keys.push(`course:${courseId}`);
    }

    await this.redisService.del(...keys);
  }
}