export class NotaResponseDTO {
  id!: string;
  alunoId!: string;
  materiaId!: string;
  materiaNome?: string;
  codigo?: string;
  term!: string;
  ac1!: number | null;
  ac2!: number | null;
  af!: number | null;
  sub!: number | null;
  ag!: number | null;
  media!: number | null;
  createdAt!: string;
}
