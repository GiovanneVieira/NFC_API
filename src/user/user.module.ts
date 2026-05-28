import { Module } from '@nestjs/common';
import { UserService } from './user';
import { UserController } from './user.controller';
import { UserMapper } from 'src/mapper/usermapper';
import { PrismaModule } from 'src/prisma-modules/prisma/prisma.module';
@Module({
  imports:[PrismaModule],
  providers: [UserService, UserMapper],
  controllers: [UserController],
  exports: [UserService, UserMapper],
})
export class UserModule {}
