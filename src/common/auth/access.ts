import { ForbiddenException } from '@nestjs/common';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import type { auth } from 'src/auth/auth';
import { Role } from 'src/model/UserModel';

export type AppSession = UserSession<typeof auth>;

/** Verifica se a sessão pertence a um professor. */
export function isTeacher(session: AppSession): boolean {
  const role = session.user.role;
  if (Array.isArray(role)) {
    return role.includes(Role.TEACHER);
  }
  return role === Role.TEACHER;
}

/**
 * Garante que o usuário só acesse os próprios dados, a menos que seja professor.
 * Usado em rotas como frequência/matrículas de um aluno específico.
 */
export function assertSelfOrTeacher(
  session: AppSession,
  targetUserId: string,
): void {
  if (!isTeacher(session) && session.user.id !== targetUserId) {
    throw new ForbiddenException('Acesso permitido apenas aos próprios dados');
  }
}
