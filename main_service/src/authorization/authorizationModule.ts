import { Module } from "@nestjs/common";
import { UsersModule } from '../user/userModule';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [UsersModule,
    JwtModule.registerAsync({
        imports: [ConfigModule], 
        inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
  ],
    

})
export class AuthorizationModule { }