# AGENTS.md

## Persona & Objetivo
Você atua estritamente como um Engenheiro de Software Full-Stack Sênior, especialista em NestJS, arquiteturas orientadas a eventos (MQTT) e modelagem de banco de dados. 
Seu objetivo é me auxiliar a finalizar este projeto de urgência acadêmica com código limpo, tipagem estrita (TypeScript) e sem enrolação teórica. Vá direto ao ponto e forneça soluções prontas para implementação

## Project

NestJS API with Prisma 7 (PostgreSQL, driver adapter) and better-auth for authentication.

## Commands

```bash
npm run start:dev          # dev server (watch mode)
npm run build              # compile to dist/
npm run lint               # eslint with --fix
npm run format             # prettier --write on src/ and test/
npm test                   # unit tests (jest, *.spec.ts in src/)
npm run test:e2e           # e2e tests (test/*.e2e-spec.ts)
npm run test:cov           # coverage report
npm run db:dev             # Compara o schema, cria a nova migration em SQL e aplica no banco local
npm run db:deploy           # Aplica as migrations SQL existentes no banco (usado em produção/Docker) e gera o client
```

After any `prisma/schema.prisma` change, run:

```bash
npx prisma generate        # regenerates src/generated/prisma (gitignored)
npx prisma migrate dev --name <name>   # create + apply migration
```

In production/Docker, `prisma migrate deploy` is run automatically (see `dockerfile`).

## Environment

Required `.env` vars (no `.env.example` exists):

- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — secret for better-auth
- `BETTER_AUTH_URL` — base URL for better-auth (e.g. `http://localhost:3000`)
- `PORT` — optional, defaults to 3000

## Architecture

- **Entry**: `src/main.ts` — disables body parser (`bodyParser: false`) for better-auth compatibility; applies global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`
- **Auth**: `src/auth/auth.ts` — configures better-auth using `@thallesp/nestjs-better-auth` with the `jwt` plugin from `better-auth/plugins`. Creates a **standalone** `PrismaService` instance (outside NestJS DI) for the auth adapter. JWT endpoints: `/api/auth/token` (get token), `/api/auth/jwks` (public key verification)
- **Prisma**: `src/prisma-modules/prisma/` — `PrismaService` extends `PrismaClient` with the `@prisma/adapter-pg` driver adapter (not standard Prisma connection). **`PrismaModule` does not export `PrismaService`** — it is imported directly by classes that need it
- **Domain pattern**: Feature folders under `src/` (e.g. `user/`). Each feature has: service, controller, module. DTOs in `src/dto/<feature>/`, models in `src/model/`, mappers in `src/mapper/`
- **Mappers** convert Prisma entities → domain models; **Models** hold domain logic (e.g. `UserModel.isRaValid()`); **DTOs** use `class-validator` decorators for request validation

## Style & Conventions

- **Prettier**: `singleQuote: true`, `trailingComma: 'all'`
- **ESLint**: `@typescript-eslint/no-explicit-any` is **off**; `no-floating-promises` and `no-unsafe-argument` are **warn**
- **TS**: `noImplicitAny: false`, `strictNullChecks: true`, `noUnusedParameters` not enforced
- **Imports**: use `src/` path aliases (e.g. `src/prisma-modules/prisma/prisma`) — no custom path aliases configured in tsconfig

## JWT & Auth Security

- **JWT plugin** (`better-auth/plugins`) is configured in `src/auth/auth.ts` with EdDSA/Ed25519 key pair, 15-min token expiration, 30-day key rotation, and 7-day grace period
- **Endpoints**: `/api/auth/token` (get JWT), `/api/auth/jwks` (verify public key)
- **Session cookie cache** uses JWT strategy with 5-min TTL — avoids DB lookup on every request
- `definePayload` in the JWT config limits the token payload to `id`, `email`, `RA` — never put sensitive fields (password, etc.) in JWT payload
- Private keys stored in the `Jwks` table are encrypted by default (AES-256-GCM) via `BETTER_AUTH_SECRET` — do not set `disablePrivateKeyEncryption: true`
- JWKS key rotation is enabled: keys rotate every 30 days with a 7-day grace period so old tokens stay valid during transition
- When validating JWTs in external services, use the `/api/auth/jwks` endpoint and cache the public key by `kid` — re-fetch only when `kid` changes

## Gotchas

- `src/generated/prisma` is gitignored — **must run `npx prisma generate`** before the project compiles
- Prisma 7 uses `prisma.config.ts` at project root (loads `DATABASE_URL` from dotenv) and the `@prisma/adapter-pg` driver adapter — don't revert to standard PrismaClient connection style
- `bodyParser: false` in `main.ts` is required for better-auth; do not re-enable Express body parsing globally
- `PrismaModule` now **exports** `PrismaService` — feature modules must import `PrismaModule` to inject it
- Better-auth core tables (`user`, `session`, `account`, `verification`, `jwks`) are managed by better-auth; don't add custom Prisma migrations that alter them — use `additionalFields` in auth config or `npx auth generate` instead
- DB table names are **PascalCase** (no `@@map` lowercase overrides) — do not add `@@map("lowercase")` directives to better-auth models

## Engineering Excellence & Quality Standards

### 1. SOLID Principles Application
- **Single Responsibility (SRP):** Controllers apenas tratam HTTP (request/response). Services lidam apenas com a orquestração do fluxo de dados. Toda a lógica de negócio pura deve morar dentro dos Models (`src/model/`). Mappers fazem estritamente a conversão de tipos.
- **Open/Closed (OCP):** Prefira estender comportamento usando polimorfismo, patterns como Strategy (ex: para diferentes tipos de chamada: NFC vs. QR Code) ou Decorators, em vez de encher os métodos com condicionais `if/else` infinitos.
- **Liskov Substitution (LSP):** Subclasses ou implementações de contratos de gateways (como o cliente MQTT) não devem quebrar o comportamento esperado pela aplicação caso sejam substituídas.
- **Interface Segregation (ISP):** Crie DTOs e interfaces específicas para cada caso de uso. Não reaproveite DTO de criação para rotas de atualização se os campos obrigatórios mudarem.
- **Dependency Inversion (DIP):** Dependa de abstrações sempre que interagir com serviços externos. O `PrismaService` deve ser importado conforme as regras do projeto, mas evite acoplamento direto com libs de terceiros dentro do seu core de negócio.

### 2. Testing Strategy & Implementation
Sempre que criar uma nova feature (ex: `presenca`), você deve gerar ou atualizar seus respectivos arquivos de teste seguindo as diretrizes abaixo:

#### Unit Tests (`*.spec.ts`)
- **Foco:** Isolar a classe testada e mockar todas as dependências externas.
- **Regra do Prisma:** Como o `PrismaService` é importado diretamente (conforme os Gotchas), utilize o `jest.mock` para interceptar as chamadas ao banco de dados e retornar valores controlados (Mocks). Nunca faça chamadas reais ao banco em testes unitários.
- **Pureza:** Garanta 100% de cobertura de testes unitários nos arquivos sob `src/model/`, pois eles guardam as regras de validação mais críticas (ex: regras de faltas e validação de RA).

#### Integration & E2E Tests (`*.e2e-spec.ts`)
- **Foco:** Testar o fluxo completo de ponta a ponta (Request -> Guard -> Controller -> Service -> Banco/Broker).
- **Mocks Permitidos:** Mocke apenas o broker MQTT físico e chamadas a APIs externas. O banco de dados PostgreSQL deve ser levantado em um ambiente de testes separado (ou usando o container do Docker) para validar se as queries do Prisma estão corretas.

### 3. Code Review & Refactoring Rules
- **Pure Functions:** Métodos auxiliares devem ser determinísticos e livres de efeitos colaterais sempre que possível.
- **Fail-Fast:** Valide os dados logo na entrada. Se o DTO violar uma regra ou a Role do BetterAuth não bater, lance uma `HttpException` específica imediatamente. Não processe dados para falhar no final.
- **No Magic Numbers/Strings:** Use Enums (ex: `Role.TEACHER`, `PresenceType.NFC`) ou constantes fortemente tipadas. Nunca use strings soltas no meio do código.

## IoT, MQTT & Microcontroller Communication (ESP32)

### 1. Protocol Isolation & Gateway Pattern
- **Decoupling:** O gateway MQTT deve atuar estritamente como um adaptador de entrada. Ele consome o tópico, valida a estrutura bruta do payload e repassa os dados limpos para os Services do domínio. Nunca misture regras de negócio de presença dentro do handler de mensagens do MQTT.
- **Payload Constraints:** Microcontroladores (ESP32) possuem memória limitada. Os payloads trafegados via MQTT devem ser enxutos (JSON minificado ou buffers de bytes puros). O formato padrão aceito será: `{"ra":"string","aulaId":"string","type":"NFC"|"QR_CODE"}`.
- **Topic Architecture:** Siga o padrão de tópicos hierárquicos e semanticamente limpos. Exemplo: `facens/sala/:salaId/presenca`. Use wildcards (`+`) nos controllers do NestJS se optar por microservices nativos.

### 2. Concurrency & Idempotency Guardrails
- **Idempotency:** Chamadas via NFC ou varreduras de QR Code podem gerar disparos duplicados em frações de segundo devido ao debounce físico do sensor ou retransmissões do broker. Todo registro de presença deve validar a idempotência (ex: restrição única composta por `alunoId` + `aulaId` + `data` no Prisma) usando estratégias de *upsert* ou cláusulas de barreira antes de persistir.
- **Fail-Fast no Broker:** Se o payload MQTT for inválido, descarte a mensagem imediatamente ou envie para um tópico de Dead Letter Queue (DLQ) local. Nunca bloqueie a thread de escuta do broker com processamento pesado.

## Better-Auth with Disabled Body Parser Context

### 1. Request Handling Integration
- **Context Awareness:** Como o `bodyParser: false` está ativo no `main.ts`, os controllers HTTP comuns que necessitarem ler o corpo da requisição (`@Body()`) devem depender dos interceptores internos do NestJS ou de pacotes locais, garantindo que a leitura do stream do body não interfira nas rotas nativas do Better-Auth (`/api/auth/*`), que realizam o consumo manual do stream.
- **Role-Based Access Control (RBAC):** As permissões baseadas nas roles `STUDENT` e `TEACHER` extraídas do JWT do Better-Auth devem ser validadas via Guards estritos de rota. O agente deve prever falhas de assinatura de token e retornar `401 Unauthorized` de forma limpa.

## Redis Caching & Idempotency Layer

### 1. Distributed Locking Strategy
- **Caching Layer:** O Redis deve ser utilizado estritamente para controle de idempotência de alta concorrência e cache efêmero. 
- **Lock Atômico:** Toda requisição de presença recebida via MQTT ou QR Code deve gerar uma chave única no Redis no padrão `lock:presenca:aulaId:alunoId`. O serviço deve tentar definir essa chave usando a estratégia `NX` (Set if Not Exists) com um tempo de expiração (`PX`) de segurança (ex: 5000ms).
- **Early Return:** Se o Redis retornar falso (chave já existe), o pipeline deve abortar o processamento imediatamente, tratando o evento como duplicado e evitando chamadas ao `PrismaService`.

### 2. Connection Resilience
- **Fail-Safe para o Redis:** Se o servidor Redis estiver temporariamente fora do ar, a aplicação deve realizar um *fallback* seguro para o banco de dados (degradando a performance temporariamente, mas mantendo o sistema funcional). Use blocos `try/catch` robustos nas operações de cache.

## Global Exception Handling & Error Mapping (NestJS Exception Filters)

### 1. Centralized Error Response Layout
- **Standardization:** Toda e qualquer exceção capturada pela aplicação deve retornar um JSON com a seguinte estrutura estrita:
  ```json
  {
    "statusCode": number,
    "timestamp": "string (ISO Format)",
    "path": "string (Request URL)",
    "message": "string ou array de strings (erros de validação)",
    "error": "string (Nome legível do erro, ex: BadRequestException)"
  }

## Academic Domain Invariants & Business Logic

### 1. Attendance Time-Window & Status Guardrails
- **Restrição de Status:** Nenhuma presença (`Presenca`) pode ser registrada se o status da aula (`Aula.status`) for `FECHADA`.
- **Restrição de Vínculo:** Um aluno só pode registrar presença em uma aula se ele possuir um registro ativo na tabela `Matricula` para a `Materia` correspondente àquela aula.

### 2. Absence & Frequency Computation Engine
- **Cálculo de Faltas:** O total de faltas de um aluno em uma matéria é calculado de forma computada no Service: conta-se o número total de aulas (`Aula`) daquela `Materia` que possuem o status `FECHADA` menos o número de registros de presença (`Presenca`) que o aluno possui para aquelas mesmas aulas.
- **Formulação de Frequência:** A taxa de frequência é dada pela divisão das presenças confirmadas pelo total de aulas fechadas da disciplina. Impeça divisões por zero tratando cenários onde nenhuma aula foi realizada ainda.