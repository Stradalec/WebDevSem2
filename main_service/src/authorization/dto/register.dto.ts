import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { UserRole } from "../../user/schemas/user.schema";

export class RegisterDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsEnum(UserRole)
    role!: UserRole;
}