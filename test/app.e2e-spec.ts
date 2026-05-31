import { spawn, ChildProcess } from 'node:child_process';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import * as dotenv from 'dotenv';
import request from 'supertest';

type Agent = ReturnType<typeof request.agent>;

/**
 * E2E black-box: sobe o build real numa porta isolada e exercita o fluxo
 * completo via HTTP (auth + domínio + RBAC). Evita importar o AppModule
 * (e a dependência ESM do better-auth) dentro do Jest CommonJS.
 *
 * Pré-requisitos: `npm run build` e um Postgres acessível pela DATABASE_URL.
 */
const PORT = Number(process.env.E2E_PORT ?? 3999);
const BASE = `http://localhost:${PORT}`;
const RUN = Date.now();
const CPF = String(RUN).slice(-11); // cpf único por execução (11 dígitos)

let server: ChildProcess | undefined;

async function waitForHealth(timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/health`);
      if (res.ok) return;
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error('Servidor e2e não respondeu /health a tempo');
}

beforeAll(async () => {
  const root = join(__dirname, '..');
  dotenv.config({ path: join(root, '.env') });

  const distMain = join(root, 'dist', 'main.js');
  if (!existsSync(distMain)) {
    throw new Error(
      'dist/main.js não encontrado. Rode `npm run build` antes do e2e.',
    );
  }

  server = spawn('node', [distMain], {
    cwd: root,
    env: { ...process.env, PORT: String(PORT), BETTER_AUTH_URL: BASE },
    stdio: 'ignore',
  });

  await waitForHealth();
}, 45000);

afterAll(() => {
  server?.kill();
});

describe('NFC API (e2e)', () => {
  const teacher: Agent = request.agent(BASE);
  const student: Agent = request.agent(BASE);
  let teacherId = '';
  let studentId = '';
  let materiaId = '';
  let aulaId = '';

  it('GET /health → ok', async () => {
    const res = await request(BASE).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET / é público', async () => {
    const res = await request(BASE).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello World!');
  });

  it('bloqueia rota protegida sem sessão (401)', async () => {
    const res = await request(BASE).get('/materia');
    expect(res.status).toBe(401);
  });

  it('sign-up de professor cria sessão', async () => {
    const res = await teacher.post('/api/auth/sign-up/email').send({
      email: `prof_${RUN}@facens.br`,
      password: 'senha12345',
      name: 'Eliane Rodrigues',
      RA: `PROF${RUN}`,
      role: 'TEACHER',
    });
    expect(res.status).toBe(200);
    teacherId = res.body.user.id;
    expect(teacherId).toBeTruthy();
  });

  it('sign-up de aluno cria sessão', async () => {
    const res = await student.post('/api/auth/sign-up/email').send({
      email: `aluno_${RUN}@facens.br`,
      password: 'senha12345',
      name: 'Lucas Silva',
      RA: `AL${RUN}`,
      role: 'STUDENT',
    });
    expect(res.status).toBe(200);
    studentId = res.body.user.id;
    expect(studentId).toBeTruthy();
  });

  it('GET /user/me retorna o aluno autenticado com firstName', async () => {
    const res = await student.get('/user/me');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(studentId);
    expect(res.body.firstName).toBe('Lucas');
    expect(res.body).not.toHaveProperty('password');
  });

  it('professor cria matéria (com professor auto-atribuído)', async () => {
    const res = await teacher.post('/materia').send({
      codigo: `ENG${RUN}`,
      nome: 'Engenharia de Software',
      faltaLimite: 19,
    });
    expect(res.status).toBe(201);
    materiaId = res.body.id;
    expect(res.body.professorId).toBe(teacherId);
    expect(res.body.professorNome).toBe('Eliane Rodrigues');
  });

  it('aluno NÃO pode criar matéria (403)', async () => {
    const res = await student
      .post('/materia')
      .send({ codigo: `X${RUN}`, nome: 'Proibida' });
    expect(res.status).toBe(403);
  });

  it('professor matricula o aluno', async () => {
    const res = await teacher
      .post('/matricula')
      .send({ alunoId: studentId, materiaId });
    expect(res.status).toBe(201);
    expect(res.body.active).toBe(true);
  });

  it('professor cria aula', async () => {
    const res = await teacher.post('/aula').send({
      materiaId,
      dataHora: '2026-05-31T19:00:00.000Z',
      sala: 'C29',
    });
    expect(res.status).toBe(201);
    aulaId = res.body.id;
    expect(res.body.status).toBe('ABERTA');
    expect(res.body.sala).toBe('C29');
  });

  it('aluno registra a própria presença (alunoId resolvido pela sessão)', async () => {
    const res = await student.post('/presenca').send({ aulaId, type: 'NFC' });
    expect(res.status).toBe(201);
    expect(res.body.alunoId).toBe(studentId);
  });

  it('não permite presença duplicada quebrar (idempotente via upsert)', async () => {
    const res = await student.post('/presenca').send({ aulaId, type: 'NFC' });
    expect(res.status).toBe(201);
    expect(res.body.alunoId).toBe(studentId);
  });

  it('professor fecha a aula', async () => {
    const res = await teacher.patch(`/aula/${aulaId}/fechar`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('FECHADA');
  });

  it('não permite registrar presença em aula fechada (403)', async () => {
    const res = await student.post('/presenca').send({ aulaId, type: 'NFC' });
    expect(res.status).toBe(403);
  });

  it('GET /presenca/faltas/me reflete presença (0 faltas, limite 19)', async () => {
    const res = await student.get('/presenca/faltas/me');
    expect(res.status).toBe(200);
    const falta = res.body.find((f: any) => f.materiaId === materiaId);
    expect(falta).toBeDefined();
    expect(falta.faltas).toBe(0);
    expect(falta.limite).toBe(19);
  });

  it('GET /aula/me lista as aulas da matéria matriculada', async () => {
    const res = await student.get('/aula/me');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].materiaNome).toBe('Engenharia de Software');
  });

  it('professor lança nota', async () => {
    const res = await teacher.post('/nota').send({
      alunoId: studentId,
      materiaId,
      term: '2026/01',
      ac1: 8.6,
      ac2: 7.1,
    });
    expect(res.status).toBe(201);
    expect(res.body.ac1).toBe(8.6);
  });

  it('aluno vê a própria nota em GET /nota/me', async () => {
    const res = await student.get('/nota/me').query({ term: '2026/01' });
    expect(res.status).toBe(200);
    expect(res.body[0].ac1).toBe(8.6);
    expect(res.body[0].materiaNome).toBe('Engenharia de Software');
  });

  it('aluno NÃO acessa notas de outro usuário (403)', async () => {
    const res = await student.get(`/nota/aluno/${teacherId}`);
    expect(res.status).toBe(403);
  });

  it('aluno NÃO lista usuários (rota TEACHER, 403)', async () => {
    const res = await student.get('/user');
    expect(res.status).toBe(403);
  });

  it('professor atualiza a carteirinha do aluno', async () => {
    const res = await teacher
      .patch(`/user/${studentId}/carteirinha`)
      .send({ course: 'Engenharia de Computação', cpf: CPF });
    expect(res.status).toBe(200);
    expect(res.body.course).toBe('Engenharia de Computação');
    expect(res.body.cpf).toBe(CPF);
  });

  it('valida payload inválido (DTO) com 400', async () => {
    const res = await teacher.post('/materia').send({ nome: 'sem codigo' });
    expect(res.status).toBe(400);
  });

  it('mapeia erro do Prisma: CPF duplicado → 409 (não 500)', async () => {
    // o aluno já tem CPF = CPF; tentar o mesmo no professor viola o unique (P2002)
    const res = await teacher
      .patch(`/user/${teacherId}/carteirinha`)
      .send({ cpf: CPF });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('CONFLICT');
  });
});
