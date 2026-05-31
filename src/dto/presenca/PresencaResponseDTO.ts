import { PresencaType } from 'src/model/PresencaModel';

export class PresencaResponseDTO {
  id!: string;
  alunoId!: string;
  aulaId!: string;
  data!: string;
  type!: PresencaType;
  createdAt!: string;
  alunoName?: string;
  alunoRA?: string;
}
