import { IsUUID } from 'class-validator';

export class CreateMatriculaDTO {
  @IsUUID()
  alunoId!: string;

  @IsUUID()
  materiaId!: string;
}
