import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-modules/prisma/prisma';
import { UserRequestDTO } from '../dto/user/UserRequestDTO';
import { UserMapper } from '../mapper/usermapper';
import { UserModel } from '../model/UserModel';
import { hashPassword } from '../utils/hash';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private userMapper: UserMapper,
  ) {}

  async postUser(userDto: UserRequestDTO): Promise<UserModel> {
    const prismaUser = await this.prismaService.user.create({
      data: {
        ...userDto,
        password: await hashPassword(userDto.password),
      },
    });

    return this.userMapper.toUserModel(prismaUser);
  }

  async getAllUsers(): Promise<UserModel[]> {
    const prismaUsers = await this.prismaService.user.findMany();
    return prismaUsers.map((user) => this.userMapper.toUserModel(user));
  }

  async getUserById(id: string): Promise<UserModel | null> {
    const prismaUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      return null;
    }

    return this.userMapper.toUserModel(prismaUser);
  }

  async getUserByEmail(email: string): Promise<UserModel | null> {
    const prismaUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!prismaUser) {
      return null;
    }

    return this.userMapper.toUserModel(prismaUser);
  }

  async getUserByRA(RA: string): Promise<UserModel | null> {
    const prismaUser = await this.prismaService.user.findUnique({
      where: { RA },
    });

    if (!prismaUser) {
      return null;
    }

    return this.userMapper.toUserModel(prismaUser);
  }

}
