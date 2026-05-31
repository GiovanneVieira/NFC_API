import {
  IsUUID,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { AulaStatus } from 'src/model/AulaModel';

export class CreateAulaDTO {
  @IsUUID()
  materiaId!: string;

  @IsDateString()
  dataHora!: string;

  @IsOptional()
  @IsEnum(AulaStatus)
  status?: AulaStatus;

  @IsOptional()
  @IsString()
  sala?: string;
}
