# Delphi TODO Workflow (NFC_API)

Este backend usa o fluxo de TODO tatico do `delphi-ai` para organizar cada entrega.

## Superficies canonicas do projeto

- `foundation_documentation/project_constitution.md`
- `foundation_documentation/system_roadmap.md`
- `foundation_documentation/modules/*.md`
- `foundation_documentation/todos/active/*.md`

## Estrutura minima

- `foundation_documentation/todos/active/`: TODOs em andamento
- `foundation_documentation/todos/completed/`: TODOs concluidos
- `foundation_documentation/todos/ephemeral/`: TODOs descartaveis de manutencao/regressao
- `foundation_documentation/artifacts/tmp/`: artefatos temporarios de validacao

## Abrir um TODO novo

```bash
npm run todo:new -- <nome-do-todo>
```

Exemplo:

```bash
npm run todo:new -- backend/presenca-idempotencia-redis
```

Isso cria um arquivo em `foundation_documentation/todos/active/` com o template oficial.

## Validar um TODO

```bash
npm run todo:validate -- --todo foundation_documentation/todos/active/<arquivo>.md
```

Exemplo:

```bash
npm run todo:validate -- --todo foundation_documentation/todos/active/backend/presenca-idempotencia-redis.md
```

Opcionalmente, tambem pode gerar bundle e relatorio:

```bash
npm run todo:validate -- --todo foundation_documentation/todos/active/<arquivo>.md --bundle-output foundation_documentation/artifacts/tmp/todo-bundle.json --report-json foundation_documentation/artifacts/tmp/todo-report.json
```

## Convencao para TODO de backend NestJS

- Referenciar sempre os modulos canonicos em `Canonical Module Anchors`.
- Manter `Definition of Done` com validacao tecnica real (testes/comandos).
- Para mudancas em auth, incluir `auth-and-access-control.md`.
- Para mudancas de presenca/MQTT/Redis, incluir `presence-and-iot-flow.md`.
