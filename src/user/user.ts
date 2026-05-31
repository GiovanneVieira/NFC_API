import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma-modules/prisma/prisma';
import { UserMapper } from '../mapper/usermapper';
import { UserModel } from '../model/UserModel';
import { UpdateCarteirinhaDTO } from '../dto/user/UpdateCarteirinhaDTO';

const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  RA: true,
  role: true,
  course: true,
  cpf: true,
  cardValidity: true,
  image: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private userMapper: UserMapper,
  ) {}

  async getAllUsers(): Promise<UserModel[]> {
    const prismaUsers = await this.prismaService.user.findMany({
      select: USER_PUBLIC_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return prismaUsers.map((user) => this.userMapper.toUserModel(user));
  }

  async getUserById(id: string): Promise<UserModel | null> {
    const prismaUser = await this.prismaService.user.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });

    return prismaUser ? this.userMapper.toUserModel(prismaUser) : null;
  }

  async getUserByIdOrThrow(id: string): Promise<UserModel> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<UserModel | null> {
    const prismaUser = await this.prismaService.user.findUnique({
      where: { email },
      select: USER_PUBLIC_SELECT,
    });

    return prismaUser ? this.userMapper.toUserModel(prismaUser) : null;
  }

  async getUserByRA(RA: string): Promise<UserModel | null> {
    const prismaUser = await this.prismaService.user.findUnique({
      where: { RA },
      select: USER_PUBLIC_SELECT,
    });

    return prismaUser ? this.userMapper.toUserModel(prismaUser) : null;
  }

  async updateCarteirinha(
    id: string,
    dto: UpdateCarteirinhaDTO,
  ): Promise<UserModel> {
    await this.getUserByIdOrThrow(id);

    const prismaUser = await this.prismaService.user.update({
      where: { id },
      data: {
        course: dto.course,
        cpf: dto.cpf,
        cardValidity: dto.cardValidity ? new Date(dto.cardValidity) : undefined,
      },
      select: USER_PUBLIC_SELECT,
    });

    return this.userMapper.toUserModel(prismaUser);
  }
}
