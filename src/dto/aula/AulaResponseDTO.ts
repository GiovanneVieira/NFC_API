import { AulaStatus } from 'src/model/AulaModel';

export class AulaResponseDTO {
  id!: string;
  materiaId!: string;
  materiaNome?: string;
  professorNome?: string | null;
  dataHora!: string;
  sala!: string | null;
  status!: AulaStatus;
  createdAt!: string;
}
