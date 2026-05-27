import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user/user';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    AuthModule.forRoot({
      auth
    }),
    UserModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
