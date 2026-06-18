import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateLessonDto {
    @IsString()
    @MinLength(2)
    name!: string;

    @IsString()
    @MinLength(5)
    textContent!: string;

    @IsInt()
    @Min(1)
    order!: number;
}