import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMateriaDTO {
  @IsString()
  @IsNotEmpty()
  codigo!: string;

  @IsString()
  @IsNotEmpty()
  nome!: string;
}
