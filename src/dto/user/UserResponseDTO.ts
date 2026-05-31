import { Role } from 'src/model/UserModel';

export class UserResponseDTO {
  id!: string;
  email!: string;
  name!: string;
  RA!: string;
  role!: Role;
  createdAt!: string;
}
