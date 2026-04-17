import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './user/userModule';
import { AuthorizationModule } from './authorization/authorizationModule';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), 
    MongooseModule.forRootAsync({ 
      imports: [ConfigModule], 
      inject: [ConfigService], 
      useFactory: (configService: ConfigService) => ({ 
        uri: configService.get<string>('MONGO_URL') }),
      }),
    UsersModule,
    AuthorizationModule],
    
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule { }
