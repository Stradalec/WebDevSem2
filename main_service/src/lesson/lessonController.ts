import {Body, Controller, Delete, Get, Param, Patch, Post, Req,UseGuards,} from '@nestjs/common';
import { LessonService } from './lessonService';
import { CreateLessonDto } from './dto/createLesson.dto';
import { UpdateLessonDto } from './dto/updateLesson.dto';
import { JwtAuthGuard } from '../authorization/jwt.authGuard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@Controller()
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get('courses/:courseId/lessons')
  findByCourse(@Param('courseId') courseId: string) {
    return this.lessonService.findByCourse(courseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Post('courses/:courseId/lessons')
  create(
    @Param('courseId') courseId: string,
    @Body() dto: CreateLessonDto,
    @Req() req: any,
  ) {
    return this.lessonService.create(courseId, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Patch('courses/:courseId/lessons/:lessonId')
  update(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
    @Req() req: any,
  ) {
    return this.lessonService.update(courseId, lessonId, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  @Delete('courses/:courseId/lessons/:lessonId')
  remove(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Req() req: any,
  ) {
    return this.lessonService.remove(courseId, lessonId, req.user);
  }
}