import { IsUUID, IsDateString, IsEnum } from 'class-validator';
import { AulaStatus } from 'src/model/AulaModel';

export class CreateAulaDTO {
  @IsUUID()
  materiaId!: string;

  @IsDateString()
  dataHora!: string;

  @IsEnum(AulaStatus)
  status!: AulaStatus;
}
