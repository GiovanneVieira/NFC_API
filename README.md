# NFC API

API do projeto **TINCE** — controle acadêmico com presença por **NFC/QR Code**.
Backend em **NestJS 11 + Prisma 7 (PostgreSQL) + Better Auth**.

Atende ao app (Expo/React Native): carteirinha, aulas, faltas e notas.

## Stack

- **NestJS 11** (REST)
- **Prisma 7** + PostgreSQL (driver adapter `@prisma/adapter-pg`)
- **Better Auth** (e-mail/senha + JWT EdDSA) via `@thallesp/nestjs-better-auth`
- **Scalar** para documentação OpenAPI (`/openapi`)
- **Jest** (unitários + e2e black-box)

## Pré-requisitos

- Node.js 22+ (testado com Node 24)
- PostgreSQL (via Docker recomendado)

## Configuração

1. Copie o `.env.example` para `.env` e preencha:

   ```bash
   cp .env.example .env
   ```

   Gere um segredo para o Better Auth: `openssl rand -base64 32` → `BETTER_AUTH_SECRET`.

2. Suba a infraestrutura (Postgres/Redis/Mosquitto) com Docker:

   ```bash
   docker compose up -d postgres
   ```

   > As portas do `docker-compose.yaml` estão alinhadas ao `.env`
   > (Postgres `5432`, Redis `6379`, MQTT `1883`) para rodar o Nest localmente
   > pelo terminal acessando os containers via `localhost`.

3. Aplique as migrations e gere o client:

   ```bash
   npm run db:dev        # migrate dev (ambiente de desenvolvimento)
   # ou, contra um banco já migrado:
   npx prisma migrate deploy
   ```

## Executando

```bash
npm install
npm run start:dev        # desenvolvimento (watch) — usa .env.development
npm run build && npm run start:prod   # produção — usa .env.production
```

- API: `http://localhost:3000`
- Documentação interativa (Scalar): `http://localhost:3000/openapi`
- Healthcheck: `GET /health` → `{ status, database, timestamp }`

### Popular dados de desenvolvimento (seed)

Com a API rodando:

```bash
npm run seed
```

Cria professor + alunos + matérias + matrículas + aulas + presenças + notas.
Login de teste (senha `senha12345`): `prof@facens.br`, `lucas@facens.br`, `maria@facens.br`.

## Autenticação

Usa **Better Auth** montado em `/api/auth`. Fluxo:

- **Cadastro:** `POST /api/auth/sign-up/email`
  `{ email, password, name, RA, role }` (`role`: `STUDENT` | `TEACHER`, default `STUDENT`).
- **Login:** `POST /api/auth/sign-in/email` `{ email, password }`.
- A sessão é mantida por **cookie**. O JWT (plugin) é exposto pelo Better Auth.
- **Todas as rotas exigem autenticação por padrão** (guard global). Rotas públicas
  são marcadas com `@AllowAnonymous()` (`/` e `/health`).

> **CSRF:** rotas como `sign-in` exigem o header `Origin` pertencente a
> `TRUSTED_ORIGINS`. Clientes web (Expo web) enviam `Origin` automaticamente;
> para clientes nativos/scripts, envie um `Origin` confiável.

### Papéis (RBAC)

- `TEACHER`: cria matérias/aulas, fecha aulas, matricula/desmatricula alunos,
  lança notas, atualiza carteirinha, lista usuários.
- `STUDENT`: acessa apenas os próprios dados (presença própria, suas faltas,
  suas notas, suas aulas, sua carteirinha).

## Endpoints principais

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/health` | público | Status da API + banco |
| GET | `/user/me` | autenticado | Dados do usuário logado (carteirinha) |
| GET | `/user` | TEACHER | Lista usuários |
| GET | `/user/:id` | autenticado | Usuário por id |
| PATCH | `/user/:id/carteirinha` | TEACHER | Atualiza curso/CPF/validade |
| POST | `/materia` | TEACHER | Cria matéria (professor = logado) |
| GET | `/materia` · `/materia/:id` | autenticado | Lista / detalha matérias |
| POST | `/aula` | TEACHER | Cria aula |
| GET | `/aula/me` | autenticado | Aulas das matérias do aluno |
| GET | `/aula/materia/:materiaId` | autenticado | Aulas de uma matéria |
| PATCH | `/aula/:id/fechar` | TEACHER | Fecha a aula |
| POST | `/presenca` | autenticado | Registra presença (aluno = própria) |
| GET | `/presenca/aula/:aulaId` | TEACHER | Presenças de uma aula |
| GET | `/presenca/faltas/me` | autenticado | Faltas do aluno por matéria + limite |
| GET | `/presenca/frequencia/:alunoId/:materiaId` | próprio/TEACHER | Frequência |
| POST | `/matricula` | TEACHER | Matricula aluno |
| DELETE | `/matricula/:alunoId/:materiaId` | TEACHER | Desmatricula |
| GET | `/matricula/aluno/:alunoId` | próprio/TEACHER | Matrículas do aluno |
| POST | `/nota` | TEACHER | Lança/atualiza notas (upsert por período) |
| GET | `/nota/me?term=2026/01` | autenticado | Notas do aluno |
| GET | `/nota/aluno/:alunoId?term=` | próprio/TEACHER | Notas de um aluno |

### Mapeamento com as telas do app

- **Carteirinha** → `GET /user/me` (`name`, `firstName`, `course`, `cpf`, `validity`, `RA`, `avatarUrl`).
- **Aulas** → `GET /aula/me` (com `materiaNome`, `professorNome`, `sala`, `dataHora`).
- **Faltas** → `GET /presenca/faltas/me` (`faltas`, `limite` por matéria).
- **Notas** → `GET /nota/me?term=...` (`ac1`, `ac2`, `af`, `sub`, `ag`, `media`).

## Testes

```bash
npm test                 # unitários (services/mappers/helpers, Prisma mockado)
npm run test:cov         # com cobertura
npm run build            # compila (necessário antes do e2e)
npm run test:e2e         # e2e black-box: sobe o build em :3999 e exercita o fluxo via HTTP
```

> O e2e sobe a aplicação real em um processo separado (porta `3999`) e testa
> o fluxo completo (auth, RBAC, matrícula, aula, presença, faltas, notas).
> Requer `npm run build` e um Postgres acessível pela `DATABASE_URL`.

## Integração NFC/MQTT

O broker MQTT (`MQTT_BROKER_URL`) está previsto para receber leituras do leitor
NFC físico. O registro de presença já está disponível por HTTP em `POST /presenca`
(`type: NFC | QR_CODE`); a ponte MQTT → `PresencaService` é o próximo passo de
integração com o hardware.
