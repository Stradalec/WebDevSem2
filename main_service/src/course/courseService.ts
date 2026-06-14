import { BadRequestException, ForbiddenException,Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { User, UserDocument, UserRole } from '../user/schemas/user.schema';
import { CreateCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { AuthUser } from './authUser';


@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll() {
    return this.courseModel
      .find()
      .populate('teacher', 'name email role')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const course = await this.courseModel
      .findById(id)
      .populate('teacher', 'name email role')
      .populate('lessons');

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async create(dto: CreateCourseDto, user: AuthUser) {
    if (user.role !== UserRole.TEACHER) {
      throw new ForbiddenException('Only teachers can create courses');
    }

    return this.courseModel.create({
      name: dto.name,
      description: dto.description,
      teacher: new Types.ObjectId(user.userId),
      lessons: [],
      students: [],
      studentsCount: 0,
    });
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

    return course.save();
  }

  async remove(id: string, user: AuthUser) {
    const course = await this.courseModel.findById(id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    this.ensureTeacherOwner(course, user);

    await course.deleteOne();

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
}