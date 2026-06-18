import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CourseService } from './courseService';
import { CreateCourseDto } from './dto/createCourse.dto';
import { UpdateCourseDto } from './dto/updateCourse.dto';
import { JwtAuthGuard } from '../authorization/jwt.authGuard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@Controller('courses')
export class CourseController {
    constructor(private readonly courseService: CourseService) { }

    @Get()
    findAll() {
        return this.courseService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.courseService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER)
    @Post()
    create(@Body() dto: CreateCourseDto, @Req() req: any) {
        return this.courseService.create(dto, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER)
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCourseDto, @Req() req: any) {
        return this.courseService.update(id, dto, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER)
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.courseService.remove(id, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STUDENT)
    @Post(':id/enroll')
    enroll(@Param('id') id: string, @Req() req: any) {
        return this.courseService.enroll(id, req.user);
    }
}