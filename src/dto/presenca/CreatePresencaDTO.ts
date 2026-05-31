import {
  IsEnum,
  IsUUID,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { PresencaType } from 'src/model/PresencaModel';

export class CreatePresencaDTO {
  @IsUUID()
  aulaId!: string;

  @IsEnum(PresencaType)
  type!: PresencaType;

  /**
   * Aluno da presença. Obrigatório para professores (registram por terceiros);
   * ignorado para alunos, que só registram a própria presença.
   * IDs de usuário vêm do better-auth (não são UUID).
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  alunoId?: string;
}
