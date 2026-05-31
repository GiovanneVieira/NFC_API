export enum AulaStatus {
  ABERTA = 'ABERTA',
  FECHADA = 'FECHADA',
}

export class AulaModel {
  constructor(
    public readonly id: string,
    public readonly materiaId: string,
    public readonly dataHora: Date,
    public readonly status: AulaStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly sala: string | null = null,
    public readonly materiaNome?: string,
    public readonly professorNome?: string | null,
  ) {}

  isFechada(): boolean {
    return this.status === AulaStatus.FECHADA;
  }
}
