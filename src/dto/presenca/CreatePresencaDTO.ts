import { IsEnum, IsUUID } from 'class-validator';
import { PresencaType } from 'src/model/PresencaModel';

export class CreatePresencaDTO {
  @IsUUID()
  alunoId!: string;

  @IsUUID()
  aulaId!: string;

  @IsEnum(PresencaType)
  type!: PresencaType;
}
