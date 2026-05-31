# Module - Presence And IoT Flow

## Scope
Fluxo de presenca academica por HTTP/MQTT com foco em consistencia e idempotencia.

## Canonical Coverage Status
- Status: `Partial`
- Last review: `2026-05-31`
- Remaining migration scope:
  - gateway MQTT de presenca
  - idempotencia distribuida com Redis

## Current Baseline
- Registro de presenca HTTP com `upsert` por `alunoId + aulaId`.
- Bloqueio para aula `FECHADA`.
- Bloqueio para aluno sem matricula ativa.
- Calculo de frequencia por aulas fechadas.

## Canonical Decisions
- DEC-PRES-01: evento duplicado deve ser tratado como idempotente.
- DEC-PRES-02: processamento MQTT deve validar payload e falhar rapido.
- DEC-PRES-03: regra de negocio de presenca nao fica no handler MQTT.
- DEC-PRES-04: quando Redis indisponivel, fluxo degrada para banco sem interromper servico.
- DEC-PRES-05: `PresencaType` aceito: `NFC` ou `QR_CODE`.

## Promotion Ledger
- `2026-05-31`: baseline inicial consolidada; pendente entrega de Redis lock + MQTT gateway.
