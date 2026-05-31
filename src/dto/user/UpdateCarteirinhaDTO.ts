import { IsOptional, IsString, IsDateString, Matches } from 'class-validator';

export class UpdateCarteirinhaDTO {
  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @Matches(/^\d{11}$/, { message: 'cpf deve conter exatamente 11 dígitos' })
  cpf?: string;

  @IsOptional()
  @IsDateString()
  cardValidity?: string;
}
