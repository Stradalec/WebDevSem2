import { IsString, MinLength } from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @MinLength(2)
    name!: string;

    @IsString()
    @MinLength(5)
    description!: string;
}