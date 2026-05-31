import { ForbiddenException } from '@nestjs/common';
import { isTeacher, assertSelfOrTeacher, AppSession } from './access';

const session = (id: string, role: string | string[]): AppSession =>
  ({ user: { id, role } }) as unknown as AppSession;

describe('access helpers', () => {
  describe('isTeacher', () => {
    it('true para role string TEACHER', () => {
      expect(isTeacher(session('u', 'TEACHER'))).toBe(true);
    });
    it('true para role array contendo TEACHER', () => {
      expect(isTeacher(session('u', ['STUDENT', 'TEACHER']))).toBe(true);
    });
    it('false para STUDENT', () => {
      expect(isTeacher(session('u', 'STUDENT'))).toBe(false);
    });
  });

  describe('assertSelfOrTeacher', () => {
    it('permite o próprio usuário', () => {
      expect(() =>
        assertSelfOrTeacher(session('u1', 'STUDENT'), 'u1'),
      ).not.toThrow();
    });

    it('permite professor acessar dados de terceiros', () => {
      expect(() =>
        assertSelfOrTeacher(session('prof', 'TEACHER'), 'outro'),
      ).not.toThrow();
    });

    it('bloqueia aluno acessando dados de terceiros', () => {
      expect(() => assertSelfOrTeacher(session('u1', 'STUDENT'), 'u2')).toThrow(
        ForbiddenException,
      );
    });
  });
});
