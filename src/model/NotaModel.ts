export class NotaModel {
  constructor(
    public readonly id: string,
    public readonly alunoId: string,
    public readonly materiaId: string,
    public readonly term: string,
    public readonly ac1: number | null,
    public readonly ac2: number | null,
    public readonly af: number | null,
    public readonly sub: number | null,
    public readonly ag: number | null,
    public readonly media: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly materiaNome?: string,
    public readonly codigo?: string,
  ) {}
}
