# Module - NestJS Backend Architecture

## Scope
Arquitetura da API HTTP e dos modulos de aplicacao.

## Canonical Coverage Status
- Status: `Canonical`
- Last review: `2026-05-31`
- Remaining migration scope: `none`

## Current Structure
- Entrada: `src/main.ts`
- Modulo raiz: `src/app.module.ts`
- Features: `user`, `materia`, `aula`, `matricula`, `presenca`
- Infra compartilhada: `src/prisma-modules/prisma`, `src/common/filters`, `src/openapi`

## Canonical Decisions
- DEC-ARCH-01: Controller nao contem regra de negocio.
- DEC-ARCH-02: Service orquestra casos de uso e depende de abstractions locais.
- DEC-ARCH-03: Model concentra regra de negocio pura quando aplicavel.
- DEC-ARCH-04: DTO com `class-validator` para toda entrada externa.
- DEC-ARCH-05: Mapper separado para traducao Prisma <-> dominio/API.
- DEC-ARCH-06: Excecoes devem respeitar contrato global de erro.

## Promotion Ledger
- `2026-05-31`: Criacao do modulo canonico inicial para orientar TODOs Delphi no backend.
