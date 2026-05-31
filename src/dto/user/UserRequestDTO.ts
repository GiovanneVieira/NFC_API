import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { Role } from 'src/model/UserModel';

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
  @IsEnum(Role)
  role!: Role;
}
