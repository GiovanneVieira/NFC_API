export enum PresencaType {
  NFC = 'NFC',
  QR_CODE = 'QR_CODE',
}

export class PresencaModel {
  constructor(
    public readonly id: string,
    public readonly alunoId: string,
    public readonly aulaId: string,
    public readonly data: Date,
    public readonly type: PresencaType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly alunoName?: string,
    public readonly alunoRA?: string,
  ) {}
}
