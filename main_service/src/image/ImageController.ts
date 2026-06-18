import { Controller, Get, NotFoundException, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import { ImageService } from './imageService';
import { JwtAuthGuard } from '../authorization/jwt.authGuard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import express from 'express';

const originalsPath = join(process.cwd(), 'uploads', 'originals');
const processedPath = join(process.cwd(), 'uploads', 'processed');

const imageStorage = diskStorage({
    destination: originalsPath,
    filename: (_req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
});

function imageFileFilter(
    _req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
) {
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        return callback(new Error('Only image files are allowed'), false);
    }

    callback(null, true);
}

@Controller()
export class ImageController {
    constructor(private readonly imageService: ImageService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER)
    @Post('courses/:courseId/cover')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: imageStorage,
            fileFilter: imageFileFilter,
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
        }),
    )
    uploadCourseCover(
        @Param('courseId') courseId: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        return this.imageService.uploadCourseCover(courseId, file, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TEACHER)
    @Post('lessons/:lessonId/images')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: imageStorage,
            fileFilter: imageFileFilter,
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
        }),
    )
    uploadLessonImage(
        @Param('lessonId') lessonId: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        return this.imageService.uploadLessonImage(lessonId, file, req.user);
    }

    @Get('images/:filename')
    getImage(@Param('filename') filename: string, @Res() res: express.Response) {
        const processedFilePath = join(processedPath, filename);
        const originalFilePath = join(originalsPath, filename);

        if (existsSync(processedFilePath)) {
            return res.sendFile(processedFilePath);
        }

        if (existsSync(originalFilePath)) {
            return res.sendFile(originalFilePath);
        }

        throw new NotFoundException('Image not found');
    }
}