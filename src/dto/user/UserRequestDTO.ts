import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UserRequestDTO {
  @IsEmail()
  email!: string;
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
  @IsNotEmpty()
  name!: string;
  @IsNotEmpty()
  RA!: string;
}
