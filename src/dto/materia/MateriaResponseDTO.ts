export class MateriaResponseDTO {
  id!: string;
  codigo!: string;
  nome!: string;
  faltaLimite!: number | null;
  professorId!: string | null;
  professorNome?: string;
  createdAt!: string;
}
