import { Module } from "@nestjs/common";
import { UsersModule } from '../user/userModule';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from "./authorizationController";
import { AuthorizationService } from "./authorizationService";
import { JwtStrategy } from './jwt.strategy';
@Module({
  imports: [UsersModule,
    JwtModule.registerAsync({
        imports: [ConfigModule], 
        inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthorizationService, JwtStrategy], 

})
export class AuthorizationModule { }