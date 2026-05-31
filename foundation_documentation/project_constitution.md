# Project Constitution - NFC_API

## Purpose
Definir regras arquiteturais estaveis para o backend NestJS do projeto UPX.

## Stack Baseline
- NestJS 11 + TypeScript
- Prisma 7 com `@prisma/adapter-pg` (PostgreSQL)
- Better Auth com JWT/JWKS
- MQTT para ingestao de eventos de presenca

## Non-Negotiable Invariants
- `bodyParser: false` deve permanecer em `src/main.ts` por compatibilidade com Better Auth.
- Validacao global deve manter `ValidationPipe` com `whitelist`, `forbidNonWhitelisted` e `transform`.
- Regras de negocio de dominio nao ficam em controller nem gateway MQTT.
- Nenhuma presenca e registrada para aula `FECHADA`.
- Nenhuma presenca e registrada sem matricula ativa para a materia da aula.
- Chaves e segredos nao podem ser hardcoded em codigo-fonte.

## Layer Responsibilities
- Controller: transporte HTTP e status code.
- Service: orquestracao de caso de uso.
- Model: regra de negocio pura e invariantes.
- Mapper: transformacao de entidade Prisma para modelos/DTOs.
- Prisma service: acesso a dados.

## Error Contract
- Erros devem manter payload padrao:
  - `statusCode`
  - `timestamp` (ISO)
  - `path`
  - `message`
  - `error`

## Security Baseline
- JWT com expiracao curta e validacao de assinatura.
- RBAC por `Role` (`STUDENT`, `TEACHER`) em guards dedicados.
- Jamais incluir campos sensiveis no payload JWT.

## Testing Baseline
- Unit: mock de dependencias externas, sem banco real.
- Integration/E2E: fluxo completo com banco real de teste; broker externo pode ser mockado.
- Mudanca de regra de negocio exige atualizacao de testes do modulo afetado.
