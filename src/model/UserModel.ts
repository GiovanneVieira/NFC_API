export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export class UserModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly RA: string,
    public readonly role: Role,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly course: string | null = null,
    public readonly cpf: string | null = null,
    public readonly cardValidity: Date | null = null,
    public readonly image: string | null = null,
  ) {}

  isStudent(): boolean {
    return this.role === Role.STUDENT;
  }

  isTeacher(): boolean {
    return this.role === Role.TEACHER;
  }

  /** Primeiro nome, usado em saudações e na carteirinha do app. */
  get firstName(): string {
    return this.name.trim().split(/\s+/)[0] ?? this.name;
  }
}
