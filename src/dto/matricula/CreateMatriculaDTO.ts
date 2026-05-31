import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class CreateMatriculaDTO {
  // IDs de usuário são gerados pelo better-auth (não são UUID).
  @IsString()
  @IsNotEmpty()
  alunoId!: string;

  @IsUUID()
  materiaId!: string;
}
