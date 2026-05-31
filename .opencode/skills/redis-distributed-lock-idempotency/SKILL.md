---
name: redis-distributed-lock-idempotency
description: Use ONLY when implementing routes or event listeners that write critical data (presencas, attendance) and need distributed locking to prevent duplicates. Triggers on Redis, ioredis, CacheManager, distributed lock, or idempotency patterns in NestJS.
---

# Redis Distributed Lock & Idempotency

Ao implementar rotas ou listeners de eventos que gravem dados críticos (como presenças via NFC/QR), a lógica de barreira distribuída via Redis é obrigatória antes de qualquer query do Prisma.

## 1. setup — CacheModule com Redis

No módulo onde as presenças são registradas, registre o `CacheModule` do `@nestjs/cache-manager` com store `ioredis`:

```typescript
// presenca.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT) ?? 6379,
      ttl: 5,
    }),
  ],
  // ...
})
export class PresencaModule {}
```

Variáveis de ambiente necessárias no `.env`:
- `REDIS_HOST` — default `localhost`
- `REDIS_PORT` — default `6379`

## 2. Distributed Lock com SET NX PX

Antes de qualquer `prismaService.presenca.upsert()` ou `create()`, adquira um lock atômico no Redis usando a estratégia `NX` (Set if Not Exists) com TTL explícito:

```typescript
@Injectable()
export class PresencaService {
  private readonly logger = new Logger(PresencaService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prismaService: PrismaService,
  ) {}

  async registrarPresenca(dto: PresencaRequestDTO): Promise<PresencaModel | null> {
    const lockKey = `lock:presenca:${dto.aulaId}:${dto.alunoId}`;
    const ttlMs = 5000;

    try {
      const acquired = await this.cacheManager.set(lockKey, '1', ttlMs);
      if (!acquired) {
        this.logger.warn(`Lock rejeitado | key=${lockKey} — evento duplicado descartado`);
        return null;
      }
    } catch (error) {
      this.logger.warn(`Redis indisponível | fallback sem lock | error=${error.message}`);
      // Fallback: prosseguir sem lock — degradado, mas funcional
    }

    try {
      return await this.prismaService.presenca.upsert({
        where: { alunoId_aulaId_data: { alunoId: dto.alunoId, aulaId: dto.aulaId, data: dto.data } },
        create: { alunoId: dto.alunoId, aulaId: dto.aulaId, data: dto.data, type: dto.type },
        update: {},
      });
    } finally {
      try {
        await this.cacheManager.del(lockKey);
      } catch {
        // Lock expiration via TTL é o mecanismo de limpeza secundário
      }
    }
  }
}
```

Regras da chave de lock:
- Formato obrigatório: `lock:presenca:{aulaId}:{alunoId}` — chave composta e determinística
- TTL curto e explícito: `5000ms` (5 segundos) — deve ser maior que o tempo máximo de processamento, mas curto o suficiente para liberar em caso de crash
- Valor irrelevante (`'1'`) — o que importa é a existência atômica da chave

## 3. Lock rejeitado — log em warn e descarte silencioso

Se o lock for rejeitado (chave já existe = evento duplicado em andamento):

```typescript
if (!acquired) {
  this.logger.warn(`Lock rejeitado | key=${lockKey}`);
  return null;
}
```

Regras:
- **Nunca** lance `HttpException` para o cliente em caso de lock rejeitado — o MQTT handler não tem cliente HTTP para responder
- **Nunca** empilhe retries no handler MQTT — descarte silenciosamente para evitar estouro de pilha (stack overflow por reprocessamento infinito)
- Log em nível `warn`, nunca `error` — é um cenário esperado de debounce do sensor, não uma falha do sistema
- Retorne `null` para o caller decidir o comportamento (o gateway MQTT simplesmente ignora e segue)

## 4. Fallback seguro quando Redis está fora do ar

Se o Redis estiver temporariamente indisponível, a aplicação deve **degradar graciosamente**:

```typescript
try {
  const acquired = await this.cacheManager.set(lockKey, '1', ttlMs);
  // ...
} catch (error) {
  this.logger.warn(`Redis indisponível | fallback sem lock | error=${error.message}`);
  // Prosseguir sem lock — a constraint única composta no Prisma é a barreira final
}
```

- Cada operação com Redis deve estar envolvida em `try/catch` separado
- O fallback é prosseguir sem lock — a `@@unique([alunoId, aulaId, data])` no schema Prisma é a rede de segurança
- Logar a queda do Redis, mas não bloquear o registro de presença
- A constraint única no banco de dados garante que duplicatas não persigam mesmo sem o Redis