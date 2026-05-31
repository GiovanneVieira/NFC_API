import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateNotaDTO {
  // ID de usuário é gerado pelo better-auth (não é UUID).
  @IsString()
  @IsNotEmpty()
  alunoId!: string;

  @IsUUID()
  materiaId!: string;

  @IsString()
  @IsNotEmpty()
  term!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  ac1?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  ac2?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  af?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  sub?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  ag?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  media?: number;
}
