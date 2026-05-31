export class FaltaResponseDTO {
  materiaId!: string;
  materiaNome!: string;
  codigo!: string;
  faltas!: number;
  /** Limite de faltas da matéria, ou null se não definido. */
  limite!: number | null;
}
