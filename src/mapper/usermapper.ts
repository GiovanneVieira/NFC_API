import { Injectable } from '@nestjs/common';
import { UserModel, Role } from 'src/model/UserModel';
import { User as PrismaUser } from '@prisma/client';
import { UserResponseDTO } from 'src/dto/user/UserResponseDTO';

type UserPublicRow = {
  id: string;
  email: string;
  name: string;
  RA: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UserMapper {
  toUserModel(prismaUser: PrismaUser): UserModel {
    return new UserModel(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.password,
      prismaUser.RA,
      prismaUser.role as Role,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  toUserModelFromPublicSelect(row: UserPublicRow): UserModel {
    return new UserModel(
      row.id,
      row.email,
      row.name,
      '',
      row.RA,
      row.role as Role,
      row.createdAt,
      row.updatedAt,
    );
  }

  toResponse(userModel: UserModel): UserResponseDTO {
    return {
      id: userModel.id,
      email: userModel.email,
      name: userModel.name,
      RA: userModel.RA,
      role: userModel.role,
      createdAt: userModel.createdAt.toISOString(),
    };
  }
}
