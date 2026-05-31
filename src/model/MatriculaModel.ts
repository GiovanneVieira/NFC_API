export class MatriculaModel {
  constructor(
    public readonly id: string,
    public readonly alunoId: string,
    public readonly materiaId: string,
    public readonly active: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly materiaCodigo?: string,
    public readonly materiaNome?: string,
  ) {}

  isActive(): boolean {
    return this.active;
  }
}
