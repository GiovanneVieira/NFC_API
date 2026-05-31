---
name: iot-mock-validator
description: Use ONLY when generating code that consumes NFC or QR Code hardware events via MQTT, or when creating IoT-related features (presenca, sala, presença). Validates that mock publisher scripts, payload sanitization, and error responses follow IoT best practices.
---

# IoT Mock Validator

Ao gerar código que consuma eventos de hardware (NFC/QR Code) via MQTT, esta skill garante três requisitos obrigatórios:

## 1. Script complementar de publicação simulada

Sempre que for criado um handler MQTT no backend (NestJS), forneça também um script Node.js isolado usando a biblioteca `mqtt` capaz de publicar payloads simulados no broker local. O script deve:

- Conectar ao broker MQTT configurado no projeto (variável de ambiente `MQTT_BROKER_URL`, default `mqtt://localhost:1883`)
- Publicar no tópico esperado pelo handler (ex: `facens/sala/:salaId/presenca`)
- Enviar no formato JSON minificado: `{"ra":"string","aulaId":"string","type":"NFC"|"QR_CODE"}`
- Suportar execução via `node scripts/mock-publisher.mjs` sem dependências extras além de `mqtt`
- Incluir tratamento de `connack` error e `reconnect` automático

## 2. Sanitização estrita de payloads de hardware

Todo handler MQTT no NestJS deve sanitizar dados brutos vindos do ESP32 antes de processá-los:

- Validar que `ra` contém apenas caracteres alfanuméricos e tem o comprimento esperado (6 dígitos), rejeitando strings corrompidas ou vazias
- Validar que `type` é estritamente `"NFC"` ou `"QR_CODE"` (usar Enum, nunca strings soltas)
- Validar que `aulaId` é um UUID válido
- Rejeitar silenciosamente payloads com campos extras não esperados (fail-fast)
- Implementar idempotência: usar `upsert` ou constraint única composta (`alunoId` + `aulaId` + `data`) para evitar registros duplicados por debounce do sensor

## 3. Respostas de erro sem exposição de stack

Endpoints e handlers MQTT que lidam com falhas de IoT devem:

- Retornar respostas de erro com estrutura fixa: `{ "statusCode": number, "message": string, "error": string }`
- Nunca incluir stack traces, mensagens do Prisma/PostgreSQL, ou detalhes internos do banco de dados
- Mapear erros do Prisma (`P2002`, `P2025`, etc.) para mensagens genéricas via um exception filter do NestJS
- Em caso de timeout de rede com o broker MQTT, retornar `503 Service Unavailable` sem expor detalhes da conexão