# Title
Bootstrap do fluxo Delphi para backlog backend NestJS

## Artifact Identity
- **Artifact type:** `tactical_execution_contract`

## Context
Estabelecer o primeiro ciclo formal de entrega backend com TODO validavel e modulos canonicos.

## Framing Source & Story Slice
- **Feature brief:** `direct-to-todo`
- **Primary story ID:** `ST-01`
- **Why this is the right current slice:** precisamos iniciar as proximas entregas do backend em um fluxo governado.
- **Direct-to-TODO rationale (required when `Feature brief = direct-to-todo`):** trabalho pequeno, foco em padrao de execucao.

## Contract Boundary
- This TODO defines **WHAT** must be delivered and what counts as done.
- `Assumptions Preview` and `Execution Plan` below define **HOW** Delphi currently intends to deliver this contract.
- This TODO is **bounded but elastic**: Delphi may absorb local discoveries only while they remain inside the same primary objective and the same main approval/review/promotion conversation. Secondary modules may still be touched when they are subordinate to that same slice.
- If any assumption or plan step changes `Scope`, `Out of Scope`, `Definition of Done`, required validation semantics, public contract, or frozen decisions, update the TODO contract first and request renewed approval before execution continues.

## Delivery Status Canon (Required)
- **Current delivery stage:** `Pending`
- **Qualifiers:** `none`
- **Next exact step:** revisar e aprovar este TODO com o time para iniciar o primeiro item de implementacao.

## Scope
- [ ] Definir o primeiro item de implementacao do backend (ex: RBAC ou idempotencia Redis) seguindo este TODO.
- [ ] Registrar decisoes tecnicas iniciais e validacoes.

## Out of Scope
- [ ] Implementar features de produto neste TODO de bootstrap.

## Definition of Done
- [ ] TODO aprovado com baseline congelada.
- [ ] Primeiro TODO de implementacao derivado e criado em `active/backend/`.

## Validation Steps
- [ ] `npm run todo:validate -- --todo foundation_documentation/todos/active/backend/bootstrap-backend-delphi-flow.md`

## Profile Scope & Handoffs (Required Before `APROVADO`)
- **Primary execution profile:** `operational-coder`
- **Active technical scope:** `cross-stack`
- **Expected supporting profiles:** `none`
- **Scope-check command:** `python3 ../delphi-ai/tools/profile_scope_check.py --profile operational-coder`

## Complexity
- **Level (`small|medium|big`):** `small`
- **Checkpoint policy:** `consolidated`
- **Why this level:** alinhamento de processo sem alteracao de runtime.

## Canonical Module Anchors (Required Before APROVADO)
- **Primary module doc:** `foundation_documentation/modules/nestjs-backend-architecture.md`
- **Secondary module docs (if any):**
  - `foundation_documentation/modules/auth-and-access-control.md`
  - `foundation_documentation/modules/presence-and-iot-flow.md`
- **Planned decision promotion targets (module sections):**
  - `Canonical Decisions`
- **Module decision consolidation targets (required):**
  - `Promotion Ledger`
