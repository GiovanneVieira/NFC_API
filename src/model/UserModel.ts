export class UserModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly password: string,
    public readonly RA: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isRaValid(): boolean {
    return this.RA.length === 6;
  }
}
