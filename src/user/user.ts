import { Body, Injectable, Post } from '@nestjs/common';
import { PrismaService } from '../prisma-modules/prisma/prisma';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  @Post()
  public postUser: User  = (@Body() userDto: UserRequestDTO) => {


  };
}
