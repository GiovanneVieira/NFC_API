---
name: prisma-concurrency-strategy
description: Use ONLY when implementing batch attendance registration, concurrent presence endpoints, or any Prisma write that can receive duplicate simultaneous requests (NFC tap, QR scan, Promise.all stress tests). Ensures idempotent writes with row-level locking and prevents phantom reads or table locks.
---

# Prisma Concurrency Strategy

ParaRegistro de presença em lote ou concorrência simultânea (múltiplos alunos entrando na sala ao mesmo tempo), todas as regras abaixo são obrigatórias.

## 1. Upsert ou cláusulas de negação — nunca create() nu em rota de presença

Sempre que o endpoint puder receber disparos duplicados em frações de segundo (debounce do ESP32, retransmissão do broker MQTT), use **upsert** ou **create com cláusula WHERE NOT EXISTS** para garantir idempotência:

```typescript
// Padrão recomendado: upsert com约束 única composta
await this.prismaService.presenca.upsert({
  where: {
    alunoId_aulaId_data: {
      alunoId,
      aulaId,
      data,
    },
  },
  create: {
    alunoId,
    aulaId,
    data,
    type: PresenceType.NFC,
  },
  update: {},
});
```

Ou, se preferir create com verificação:

```typescript
await this.prismaService.$executeRaw`
  INSERT INTO "Presenca" ("alunoId", "aulaId", "data", "type")
  VALUES (${alunoId}, ${aulaId}, ${data}, ${type})
  ON CONFLICT ("alunoId", "aulaId", "data") DO NOTHING
`;
```

Nunca use `prisma.presenca.create()` simples em fluxos de NFC/QR — o debounce do sensor gera duplicatas.

## 2. Isolamento de transação — Row Lock, nunca Table Lock

Ao usar transações interativas do Prisma (`$transaction`), configure o nível de isolamento para **Serializable** apenas quando estritamente necessário. O padrão **Read Committed** do PostgreSQL é suficiente para upserts com constraint única:

```typescript
// Transação interativa com isolamento explícito (só se necessário)
await this.prismaService.$transaction(
  async (tx) => {
    // Lock apenas na linha do aluno, nunca na tabela inteira
    const aluno = await tx.user.findUnique({
      where: { id: alunoId },
    });

    await tx.presenca.upsert({
      where: { alunoId_aulaId_data: { alunoId, aulaId, data } },
      create: { alunoId, aulaId, data, type },
      update: {},
    });
  },
  {
    isolationLevel: 'Serializable', // apenas se houver race condition verificada
    timeout: 5000,
  },
);
```

Regras de isolamento:
- **Nunca** use `SELECT ... FOR UPDATE` sem `WHERE` na tabela inteira — isso gera Table Lock
- Sempre filtre o lock por `id` ou constraint única para limitar o bloqueio à linha (Row Lock)
- Se a transação precisar ler e depois escrever, faça o `findUnique` com lock dentro da mesma transação
- Prefira `upsert` a `findUnique + create` — o upsert é atômico e elimina a janela de race condition

## 3. Constraint única composta obrigatória no schema

O modelo `Presenca` no `schema.prisma` deve ter uma constraint única composta:

```prisma
model Presenca {
  id      String        @id @default(uuid())
  alunoId String
  aulaId  String
  data    DateTime
  type    PresenceType

  aluno   Aluno         @relation(fields: [alunoId], references: [id], onDelete: Cascade)
  aula    Aula          @relation(fields: [aulaId], references: [id], onDelete: Cascade)

  @@unique([alunoId, aulaId, data], name: "alunoId_aulaId_data")
}
```

O `@@unique` é o mecanismo de último recurso — mesmo que o código falhe em prevenir duplicatas, o banco de dados rejeitará a inserção duplicada.

## 4. Teste de estresse unitário obrigatório

Todo service de presença deve ter um teste unitário que dispara 50 requisições simultâneas idênticas via `Promise.all` e valida que **apenas um registro** foi persistido:

```typescript
it('should register only one presenca when 50 concurrent identical requests arrive', async () => {
  const dto = { alunoId: 'uuid-aluno', aulaId: 'uuid-aula', data: new Date('2026-05-30'), type: 'NFC' };

  const results = await Promise.all(
    Array.from({ length: 50 }, () =>
      service.registrarPresenca(dto).catch((e) => e),
    ),
  );

  const successful = results.filter((r) => !(r instanceof Error));
  expect(successful).toHaveLength(1);

  const count = await prismaService.presenca.count({
    where: { alunoId: dto.alunoId, aulaId: dto.aulaId, data: dto.data },
  });
  expect(count).toBe(1);
});
```

- Use `jest.mock` para o broker MQTT (nunca publish real em teste)
- Use `jest.mock` para o `PrismaService` com implementação que simula upsert idempotente
- Para testes de integração reais contra PostgreSQL, use database de teste separado (ver AGENTS.md seção de testes)