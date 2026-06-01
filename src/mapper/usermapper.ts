import { Injectable } from '@nestjs/common';
import { UserModel, Role } from 'src/model/UserModel';
import { UserResponseDTO } from 'src/dto/user/UserResponseDTO';

/** Linha do Prisma com os campos publicos do usuario (sem credenciais). */
export type UserRow = {
  id: string;
  email: string;
  name: string;
  RA: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  nfcUid?: string | null;
  course?: string | null;
  cpf?: string | null;
  cardValidity?: Date | null;
  image?: string | null;
};

@Injectable()
export class UserMapper {
  toUserModel(row: UserRow): UserModel {
    return new UserModel(
      row.id,
      row.email,
      row.name,
      row.RA,
      row.role as Role,
      row.createdAt,
      row.updatedAt,
      row.nfcUid ?? null,
      row.course ?? null,
      row.cpf ?? null,
      row.cardValidity ?? null,
      row.image ?? null,
    );
  }

  toResponse(userModel: UserModel): UserResponseDTO {
    return {
      id: userModel.id,
      email: userModel.email,
      name: userModel.name,
      firstName: userModel.firstName,
      RA: userModel.RA,
      role: userModel.role,
      course: userModel.course,
      cpf: userModel.cpf,
      validity: userModel.cardValidity?.toISOString() ?? null,
      avatarUrl: userModel.image,
      createdAt: userModel.createdAt.toISOString(),
    };
  }
}
