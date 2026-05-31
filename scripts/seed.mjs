/**
 * Seed de desenvolvimento via HTTP (idempotente).
 *
 * Pré-requisito: a API precisa estar rodando (npm run start:dev) e o banco
 * acessível. Uso:
 *   BASE_URL=http://localhost:3000 node scripts/seed.mjs
 *
 * Cria um professor, alunos, matérias, matrículas, aulas, presenças e notas
 * para popular as telas do app (Aulas, Faltas, Notas, Carteirinha).
 */
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const TERM = '2026/01';
let cookie = '';

function setCookieFrom(res) {
  const list = res.headers.getSetCookie?.() ?? [];
  if (list.length) {
    cookie = list.map((c) => c.split(';')[0]).join('; ');
  }
}

async function api(path, { method = 'GET', body, auth = false } = {}) {
  // Origin confiável: o better-auth exige Origin (CSRF) em rotas como sign-in.
  const headers = { 'Content-Type': 'application/json', Origin: BASE };
  if (auth && cookie) headers.Cookie = cookie;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  setCookieFrom(res);
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* sem corpo */
  }
  return { status: res.status, data };
}

async function signUpOrIn(user) {
  let res = await api('/api/auth/sign-up/email', { method: 'POST', body: user });
  if (res.status === 200 && res.data?.user) {
    return res.data.user.id;
  }
  // já existe → faz login
  res = await api('/api/auth/sign-in/email', {
    method: 'POST',
    body: { email: user.email, password: user.password },
  });
  if (res.status === 200 && res.data?.user) {
    return res.data.user.id;
  }
  throw new Error(
    `Falha ao autenticar ${user.email}: ${res.status} ${JSON.stringify(res.data)}`,
  );
}

async function ensureMateria(materia) {
  const res = await api('/materia', { method: 'POST', body: materia, auth: true });
  if (res.status === 201) return res.data.id;
  // conflito de código → busca na lista
  const list = await api('/materia', { auth: true });
  const found = (list.data ?? []).find((m) => m.codigo === materia.codigo);
  if (found) return found.id;
  throw new Error(`Falha ao criar matéria ${materia.codigo}: ${JSON.stringify(res.data)}`);
}

async function enroll(alunoId, materiaId) {
  const res = await api('/matricula', {
    method: 'POST',
    body: { alunoId, materiaId },
    auth: true,
  });
  // 201 ok; 400 = já matriculado (idempotente)
  if (![201, 400].includes(res.status)) {
    console.warn(`  matrícula ${alunoId}/${materiaId}: ${res.status}`);
  }
}

async function main() {
  console.log(`Seed → ${BASE}`);

  // 1) Professor (mantém a sessão para as próximas chamadas)
  const profId = await signUpOrIn({
    email: 'prof@facens.br',
    password: 'senha12345',
    name: 'Eliane Rodrigues',
    RA: 'PROF001',
    role: 'TEACHER',
  });
  console.log(`professor: ${profId}`);

  // guarda o cookie do professor (signUpOrIn dos alunos troca a sessão)
  const profCookie = cookie;

  // 2) Alunos
  const alunos = [];
  for (const a of [
    { email: 'lucas@facens.br', name: 'Lucas Silva Souza', RA: '900001' },
    { email: 'maria@facens.br', name: 'Maria Oliveira', RA: '900002' },
  ]) {
    const id = await signUpOrIn({ ...a, password: 'senha12345', role: 'STUDENT' });
    alunos.push({ id, ...a });
    console.log(`aluno: ${a.name} (${id})`);
  }

  // restaura a sessão do professor
  cookie = profCookie;

  // 3) Carteirinha dos alunos
  for (const a of alunos) {
    await api(`/user/${a.id}/carteirinha`, {
      method: 'PATCH',
      auth: true,
      body: {
        course: 'Engenharia de Computação',
        cardValidity: '2027-12-31T00:00:00.000Z',
      },
    });
  }

  // 4) Matérias
  const materias = [];
  for (const m of [
    { codigo: 'ENG-SW', nome: 'Engenharia de Software', faltaLimite: 19 },
    { codigo: 'PDM-2026', nome: 'Programação para Dispositivos Móveis', faltaLimite: 18 },
    { codigo: 'UPX-TIC', nome: 'UPX - TIC para Cidades Inteligentes', faltaLimite: 29 },
  ]) {
    const id = await ensureMateria(m);
    materias.push({ id, ...m });
    console.log(`matéria: ${m.nome} (${id})`);
  }

  // 5) Matrículas (todos os alunos em todas as matérias)
  for (const a of alunos) {
    for (const m of materias) {
      await enroll(a.id, m.id);
    }
  }

  // 6) Aulas + presenças + notas por matéria
  for (const m of materias) {
    // 3 aulas: 2 fechadas (passado) + 1 aberta
    const datas = [
      '2026-02-10T19:00:00.000Z',
      '2026-02-17T19:00:00.000Z',
      '2026-02-24T19:00:00.000Z',
    ];
    const aulaIds = [];
    for (const dataHora of datas) {
      const res = await api('/aula', {
        method: 'POST',
        body: { materiaId: m.id, dataHora, sala: 'C29' },
        auth: true,
      });
      if (res.status === 201) aulaIds.push(res.data.id);
    }

    // presenças nas 2 primeiras aulas para o Lucas; só na 1ª para a Maria
    if (aulaIds[0]) {
      for (const a of alunos) {
        await api('/presenca', {
          method: 'POST',
          body: { alunoId: a.id, aulaId: aulaIds[0], type: 'NFC' },
          auth: true,
        });
      }
    }
    if (aulaIds[1]) {
      await api('/presenca', {
        method: 'POST',
        body: { alunoId: alunos[0].id, aulaId: aulaIds[1], type: 'QR_CODE' },
        auth: true,
      });
    }

    // fecha as 2 primeiras aulas
    for (const id of aulaIds.slice(0, 2)) {
      await api(`/aula/${id}/fechar`, { method: 'PATCH', auth: true });
    }

    // notas do termo
    for (const a of alunos) {
      await api('/nota', {
        method: 'POST',
        auth: true,
        body: {
          alunoId: a.id,
          materiaId: m.id,
          term: TERM,
          ac1: a.email === 'lucas@facens.br' ? 8.6 : 7.0,
          ac2: 7.1,
        },
      });
    }
  }

  console.log('\n✅ Seed concluído.');
  console.log('Login de teste → prof@facens.br | lucas@facens.br | maria@facens.br (senha: senha12345)');
}

main().catch((e) => {
  console.error('Seed falhou:', e);
  process.exit(1);
});
