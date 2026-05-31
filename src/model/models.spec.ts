import { UserModel, Role } from './UserModel';
import { MateriaModel } from './MateriaModel';
import { AulaModel, AulaStatus } from './AulaModel';
import { PresencaModel, PresencaType } from './PresencaModel';
import { MatriculaModel } from './MatriculaModel';
import { NotaModel } from './NotaModel';

const now = new Date('2026-01-01T00:00:00Z');

describe('UserModel', () => {
  const aluno = new UserModel(
    'u1',
    'a@x.com',
    'Lucas Silva Souza',
    '202501',
    Role.STUDENT,
    now,
    now,
  );
  const prof = new UserModel(
    'u2',
    'p@x.com',
    'Eliane',
    'P01',
    Role.TEACHER,
    now,
    now,
  );

  it('isStudent / isTeacher', () => {
    expect(aluno.isStudent()).toBe(true);
    expect(aluno.isTeacher()).toBe(false);
    expect(prof.isTeacher()).toBe(true);
    expect(prof.isStudent()).toBe(false);
  });

  it('firstName extrai o primeiro nome', () => {
    expect(aluno.firstName).toBe('Lucas');
    expect(prof.firstName).toBe('Eliane');
  });

  it('firstName lida com nome com espaços extras', () => {
    const u = new UserModel(
      'u3',
      'b@x.com',
      '  Ana  Maria ',
      'R1',
      Role.STUDENT,
      now,
      now,
    );
    expect(u.firstName).toBe('Ana');
  });

  it('campos da carteirinha default null', () => {
    expect(aluno.course).toBeNull();
    expect(aluno.cpf).toBeNull();
    expect(aluno.cardValidity).toBeNull();
    expect(aluno.image).toBeNull();
  });
});

describe('AulaModel', () => {
  it('isFechada reflete o status', () => {
    const aberta = new AulaModel('a1', 'm1', now, AulaStatus.ABERTA, now, now);
    const fechada = new AulaModel(
      'a2',
      'm1',
      now,
      AulaStatus.FECHADA,
      now,
      now,
      'C29',
    );
    expect(aberta.isFechada()).toBe(false);
    expect(fechada.isFechada()).toBe(true);
    expect(fechada.sala).toBe('C29');
  });
});

describe('MatriculaModel', () => {
  it('isActive reflete o vínculo', () => {
    const ativa = new MatriculaModel('m1', 'a', 'mat', true, now, now);
    const inativa = new MatriculaModel(
      'm2',
      'a',
      'mat',
      false,
      now,
      now,
      'E1',
      'Eng',
    );
    expect(ativa.isActive()).toBe(true);
    expect(inativa.isActive()).toBe(false);
    expect(inativa.materiaNome).toBe('Eng');
  });
});

describe('MateriaModel', () => {
  it('mantém os campos básicos e opcionais', () => {
    const m = new MateriaModel(
      'm1',
      'E1',
      'Eng',
      now,
      now,
      19,
      'prof-1',
      'Prof',
    );
    expect(m.codigo).toBe('E1');
    expect(m.faltaLimite).toBe(19);
    expect(m.professorNome).toBe('Prof');
  });
});

describe('PresencaModel', () => {
  it('mantém tipo e dados opcionais do aluno', () => {
    const p = new PresencaModel(
      'p1',
      'a',
      'au',
      now,
      PresencaType.NFC,
      now,
      now,
      'Lucas',
      '202501',
    );
    expect(p.type).toBe(PresencaType.NFC);
    expect(p.alunoName).toBe('Lucas');
    expect(p.alunoRA).toBe('202501');
  });
});

describe('NotaModel', () => {
  it('mantém as notas e dados da matéria', () => {
    const n = new NotaModel(
      'n1',
      'a',
      'mat',
      '2026/01',
      8.6,
      7.1,
      null,
      null,
      null,
      null,
      now,
      now,
      'Eng',
      'E1',
    );
    expect(n.term).toBe('2026/01');
    expect(n.ac1).toBe(8.6);
    expect(n.materiaNome).toBe('Eng');
  });
});
