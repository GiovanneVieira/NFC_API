export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export class UserModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly password: string,
    public readonly RA: string,
    public readonly role: Role,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isRaValid(): boolean {
    return this.RA.length === 6;
  }

  isStudent(): boolean {
    return this.role === Role.STUDENT;
  }

  isTeacher(): boolean {
    return this.role === Role.TEACHER;
  }
}
