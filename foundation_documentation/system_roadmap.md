# System Roadmap - NFC_API

## Stage 1 - Foundation Hardening
- Padronizar configuracao de ambiente (`.env` vs `.env.development`).
- Completar endpoints de `user` e cobertura minima de testes.
- Corrigir pontos de encoding em mensagens e docs.

## Stage 2 - Auth & Access Control
- Implementar guards de autenticacao JWT.
- Implementar autorizacao por role para rotas academicas.
- Definir politica de acesso por recurso (professor/aluno/admin quando existir).

## Stage 3 - Presence Reliability
- Adicionar camada de idempotencia com Redis (`lock:presenca:aulaId:alunoId`).
- Integrar fluxo MQTT para registro de presenca via gateway desacoplado.
- Adicionar fallback seguro quando Redis estiver indisponivel.

## Stage 4 - Observability & Quality
- Estruturar logs por caso de uso e correlacao de request/evento.
- Expandir testes de regressao e cenarios de concorrencia.
- Validar performance basica para rotas de listagem e presenca.
