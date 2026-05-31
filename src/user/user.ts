import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-modules/prisma/prisma';
import { UserRequestDTO } from '../dto/user/UserRequestDTO';
import { UserMapper } from '../mapper/usermapper';
import { UserModel } from '../model/UserModel';
import { hashPassword } from '../utils/hash';

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  RA: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private userMapper: UserMapper,
  ) {}

  async postUser(userDto: UserRequestDTO): Promise<UserModel> {
    const prismaUser = await this.prismaService.user.create({
      data: {
        email: userDto.email,
        name: userDto.name,
        RA: userDto.RA,
        role: userDto.role,
        password: await hashPassword(userDto.password),
      },
      select: USER_PUBLIC_SELECT,
    });

    return this.userMapper.toUserModelFromPublicSelect(prismaUser);
  }

  async getAllUsers(): Promise<UserModel[]> {
    const prismaUsers = await this.prismaService.user.findMany({
      select: USER_PUBLIC_SELECT,
    });

    return prismaUsers.map((user) =>
      this.userMapper.toUserModelFromPublicSelect(user),
    );
  }

  async getUserById(id: string): Promise<UserModel | null> {
    const prismaUser = await this.prismaService.user.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });

    if (!prismaUser) {
      return null;
    }

    return this.userMapper.toUserModelFromPublicSelect(prismaUser);
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
