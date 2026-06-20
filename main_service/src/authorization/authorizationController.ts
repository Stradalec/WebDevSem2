import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthorizationService } from './authorizationService';
import { JwtAuthGuard } from './jwt.authGuard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthorizationService) { }
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }

}