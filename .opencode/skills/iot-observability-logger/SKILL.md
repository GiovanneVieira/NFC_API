---
name: iot-observability-logger
description: Use ONLY when implementing MQTT gateways, IoT payload handlers, or any NestJS service that processes hardware-originated data (NFC, QR Code, ESP32). Ensures structured logging via NestJS Logger, safe error diagnostics, and prevention of auth secret leaks in logs.
---

# IoT Observability Logger

Todo gateway ou service que processe payloads vindos de hardware deve implementar logs estritos usando o `Logger` nativo do NestJS. As três regras abaixo são obrigatórias.

## 1. Log de entrada — salaId e tamanho do pacote

Ao receber qualquer payload MQTT, logue imediatamente em nível `debug`:

```typescript
import { Logger } from '@nestjs/common';

export class PresencaGateway {
  private readonly logger = new Logger(PresencaGateway.name);

  @SubscribeMessage('facens/sala/+/presenca')
  handleMessage(payload: string, topic: string) {
    const salaId = topic.split('/')[2];
    this.logger.debug(`MQTT payload received | salaId=${salaId} | size=${Buffer.byteLength(payload)} bytes`);
    // ... processamento
  }
}
```

- Logar `salaId` permite rastrear qual sala física originou o evento
- Logar o tamanho do pacote em bytes detecta payloads anormais (truncados, corrompidos, oversized)
- Nível `debug` — não aparece em produção por padrão, mas fica disponível para diagnóstico sob demanda

## 2. Falha de parsing — logar a string malformada para diagnóstico de hardware

Quando o JSON vindo do microcontrolador falhar no parse, logue a string original em nível `warn` para diagnóstico do firmware do ESP32:

```typescript
try {
  const data = JSON.parse(payload);
} catch (error) {
  this.logger.warn(
    `MQTT payload malformed | topic=${topic} | raw='${payload}' | error=${error.message}`,
  );
  // Descarte silenciosamente — não propague o erro para o broker handler
  return;
}
```

Regras:
- Logar a string malformada **como está** (entre aspas simples) para que o time de hardware possa reproduzir o bug no firmware
- Logar o `topic` completo para identificar qual sala/sensor enviou o dado corrompido
- **Nunca** lance exception não tratada no handler MQTT — isso bloqueia a thread de escuta do broker
- Classificar como `warn`, não `error` — é um problema de hardware, não do backend

## 3. Proteção de secrets — Nunca vazar dados do BetterAuth em logs

Garanta absolutamente que informações sensíveis **nunca** apareçam em logs do console:

| Nunca logar | Motivo |
|---|---|
| `BETTER_AUTH_SECRET` | Chave mestra de assinatura/criptografia |
| JWT `privateKey` da tabela `Jwks` | Chave privada Ed25519 para assinar tokens |
| Senhas (`password` do User) | Credencial em claro |
| Tokens de sessão completos | Permitem sequestro de sessão |
| `accessToken`, `refreshToken` da Account | Credenciais OAuth de terceiros |

Implementação prática:

```typescript
// ERRADO — vaza secrets
this.logger.log(`User created: ${JSON.stringify(user)}`);

// CORRETO — logar apenas campos seguros
this.logger.log(`User created: id=${user.id} email=${user.email}`);

// Para payloads MQTT com RA, logar apenas o necessário
this.logger.debug(`Presenca registrada | alunoId=${aluno.id} aulaId=${aulaId}`);
```

- Em DTOs de resposta (mapper), certifique-se de que `password`, `privateKey` e tokens nunca sejam serializados
- Se usar `JSON.stringify` em logs, passe por uma função sanitizadora que remova campos sensíveis:

```typescript
const SAFE_KEYS: (keyof User)[] = ['id', 'email', 'name', 'RA', 'createdAt'];
const sanitize = <T extends Record<string, unknown>>(obj: T, keys: (keyof T)[]): Partial<T> =>
  Object.fromEntries(keys.map((k) => [k, obj[k]])) as Partial<T>;
```

- Configure o `Logger` do NestJS em produção com nível `log` no mínimo — `debug` e `verbose` devem ficar restritos a ambientes de desenvolvimento