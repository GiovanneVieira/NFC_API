# Module - Auth And Access Control

## Scope
Autenticacao e autorizacao da API.

## Canonical Coverage Status
- Status: `Partial`
- Last review: `2026-05-31`
- Remaining migration scope:
  - guards de JWT por rota
  - RBAC explicito para `STUDENT` e `TEACHER`

## Current Baseline
- Better Auth ativo em `src/auth/auth.ts`
- JWT/JWKS habilitado
- OpenAPI combinado com rotas de auth

## Canonical Decisions
- DEC-AUTH-01: payload JWT limitado a `id`, `email`, `RA`.
- DEC-AUTH-02: roles devem ser validadas em guard dedicado, nao no controller.
- DEC-AUTH-03: nenhuma rota de dominio sensivel deve depender so de validacao client-side.
- DEC-AUTH-04: segredos ficam apenas em ambiente.

## Promotion Ledger
- `2026-05-31`: baseline registrada; modulo permanece parcial ate entrega de guards + RBAC.
