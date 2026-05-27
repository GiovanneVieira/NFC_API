import { Injectable } from '@nestjs/common';
import { UserModel } from '../model/UserModel';
import { User as PrismaUser } from '@prisma/client';
import { UserResponseDTO } from '../dto/user/UserResponseDTO';

@Injectable()
export class UserMapper {
  toUserModel(prismaUser: PrismaUser): UserModel {
    return new UserModel(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.password,
      prismaUser.RA,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }
  toResponse(userModel: UserModel): UserResponseDTO {
    return {
      id: userModel.id,
      email: userModel.email,
      name: userModel.name,
      RA: userModel.RA,
      createdAt: userModel.createdAt.toISOString(),
    };
  }
}
