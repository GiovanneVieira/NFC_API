import { Role } from 'src/model/UserModel';

export class UserResponseDTO {
  id!: string;
  email!: string;
  name!: string;
  firstName!: string;
  RA!: string;
  role!: Role;
  course!: string | null;
  cpf!: string | null;
  /** Validade da carteirinha (ISO string) ou null. */
  validity!: string | null;
  avatarUrl!: string | null;
  createdAt!: string;
}
