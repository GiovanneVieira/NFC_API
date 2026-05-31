---
name: stream-body-parser-safety
description: Use ONLY when creating or modifying NestJS controllers that handle JSON, multipart, or file-upload requests. Ensures body parsing stays compatible with global `bodyParser: false` required by BetterAuth, and prevents stream consumption conflicts on auth endpoints.
---

# Stream Body Parser Safety

O `main.ts` desabilita `bodyParser: false` globalmente para compatibilidade com BetterAuth. Qualquer Controller novo que precise ler o corpo da requisição deve seguir estas regras obrigatoriamente:

## 1. Nunca re-habilite o body parser globalmente

Não adicione `app.use(express.json())` ou `app.use(express.urlencoded())` no `main.ts` ou em qualquer módulo global. Isso quebra os endpoints `/api/auth/*` do BetterAuth, que consomem o stream manualmente.

## 2. Injeção local de middleware de parse por rota

Para Controllers que precisam ler JSON no corpo da requisição, aplique `express.json()` **apenas no escopo do módulo**, via `forRoutes` no módulo específico:

```typescript
// No Module específico (ex: PresencaModule), NÃO no AppModule
import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { JsonBodyMiddleware } from '@nestjs/common';

export class PresencaModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(express.json())
      .forRoutes('presenca');
  }
}
```

Isso garante que o parse JSON é aplicado apenas às rotas que precisam dele, sem afetar os endpoints de autenticação.

## 3. Se a rota exigir multipart ou upload de arquivo

- Nunca use `multer` como middleware global. Use `@UseInterceptors(FileInterceptor)` do `@nestjs/platform-express` apenas no Controller específico.
- Para streams nativos, prefira processar o `req` (ReadStream) diretamente via barramentos assíncronos (ex: emitir evento via EventEmitter ou publicar no broker MQTT) em vez de acumular o buffer em memória.
- Se o payload for grande (arquivo binário, imagem), processe-o como stream e **nunca** chame `req.body` antes de consumir o stream — isso consome o buffer e quebra o BetterAuth nos endpoints de auth.

## 4. Validação com class-validator em rotas com parse local

Quando o body parser é aplicado localmente, os DTOs com decorators do `class-validator` continuam funcionando normalmente via `ValidationPipe` global (que já está configurado com `whitelist: true` e `forbidNonWhitelisted: true`). Nenhuma mudança é necessária no pipe — apenas garanta que o middleware de parse rode **antes** do Controller na pipeline.