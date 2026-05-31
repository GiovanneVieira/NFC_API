import { AulaStatus } from 'src/model/AulaModel';

export class AulaResponseDTO {
  id!: string;
  materiaId!: string;
  dataHora!: string;
  status!: AulaStatus;
  createdAt!: string;
}
