import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsUUID,
} from 'class-validator';

export class CreateMateriaDTO {
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @IsString()
  @IsNotEmpty()
  nome!: string;

  /** Limite de faltas permitido na matéria (tela de Faltas do app). */
  @IsOptional()
  @IsInt()
  @Min(0)
  faltaLimite?: number;

  /** Professor responsável. Se omitido, assume o professor autenticado. */
  @IsOptional()
  @IsUUID()
  professorId?: string;
}
