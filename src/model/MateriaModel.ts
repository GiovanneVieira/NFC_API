export class MateriaModel {
  constructor(
    public readonly id: string,
    public readonly codigo: string,
    public readonly nome: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
