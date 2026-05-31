---
name: nestjs-exception-filter-architecture
description: Use ONLY when creating or modifying NestJS exception filters, global error handlers, or Prisma error mapping code. Ensures standardized HTTP error responses, clean DTO validation mapping, Prisma error code translation, and compatibility with bodyParser:false.
---

# NestJS Exception Filter Architecture

Toda exceção capturada pela aplicação deve retornar um JSON com estrutura estrita. Esta skill define como implementar e manter os filtros de exceção globais do NestJS.

## 1. Contrato de resposta de erro

Toda resposta de erro HTTP deve seguir este formato:

```typescript
interface ErrorResponse {
  statusCode: number;
  timestamp: string; // ISO 8601
  path: string;      // request URL
  message: string | string[];
  error: string;     // nome legível, ex: "BadRequestException"
}
```

Exemplo:
```json
{
  "statusCode": 409,
  "timestamp": "2026-05-30T23:54:00.000Z",
  "path": "/api/presenca",
  "message": "Já existe um registro de presença para este aluno nesta aula",
  "error": "ConflictException"
}
```

## 2. ExceptionFilter global — implementação base

Crie o filtro em `src/common/filters/all-exceptions.filter.ts`:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as Record<string, unknown>).message ?? 'Unexpected error';

    const error =
      exception instanceof HttpException
        ? exception.name
        : 'InternalServerError';

    const body = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
    };

    if (statusCode >= 500) {
      this.logger.error(`${request.method} ${request.url} ${statusCode}`, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(`${request.method} ${request.url} ${statusCode} | message=${JSON.stringify(message)}`);
    }

    httpAdapter.reply(response, body, statusCode);
  }
}
```

## 3. Mapeamento de erros de validação de DTOs

O `ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true` já lança `BadRequestException` com um array de mensagens. O filtro acima trata isso automaticamente porque:

- `exception.getResponse()` de `BadRequestException` retorna `{ statusCode: 400, message: string[], error: "Bad Request" }`
- O filtro extrai `message` como `string | string[]`, preservando o array de restrições

**Nunca** faça flatten do array de mensagens de validação para uma string única — o contrato permite `string | string[]`.

## 4. Mapeamento de erros do Prisma

Crie um filtro dedicado em `src/common/filters/prisma-exception.filter.ts` que traduz códigos nativos do Prisma para respostas HTTP semânticas:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response, Request } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const PRISMA_ERROR_MAP: Record<string, { statusCode: number; message: string }> = {
  P2002: { statusCode: HttpStatus.CONFLICT, message: 'Violação de constraint única — registro já existe' },
  P2025: { statusCode: HttpStatus.NOT_FOUND, message: 'Registro não encontrado' },
  P2003: { statusCode: HttpStatus.BAD_REQUEST, message: 'Violação de chave estrangeira — registro relacionado não existe' },
  P2014: { statusCode: HttpStatus.BAD_REQUEST, message: 'Violação de constraint — exclusão impedida por registros dependentes' },
};

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const mapped = PRISMA_ERROR_MAP[exception.code];

    const statusCode = mapped?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message = mapped?.message ?? 'Erro interno no banco de dados';
    const error = mapped ? HttpStatus[statusCode] ?? 'InternalServerError' : 'InternalServerError';

    this.logger.error(
      `Prisma error ${exception.code} | ${request.method} ${request.url} | ${exception.message}`,
    );

    httpAdapter.reply(response, {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
    }, statusCode);
  }
}
```

Regras:
- **Nunca** exponha `exception.message` bruto do Prisma — contém detalhes do banco (nomes de tabela, colunas, stack do PostgreSQL)
- Códigos não mapeados em `PRISMA_ERROR_MAP` retornam 500 com mensagem genérica
- Log em nível `error` com o código Prisma original para diagnóstico interno

## 5. Compatibilidade com `bodyParser: false`

Como `main.ts` desabilita `bodyParser: false` para compatibilidade com BetterAuth:

- Use `httpAdapter.reply(response, body, statusCode)` dos filtros — **nunca** `response.json()` diretamente, pois o adapter NestJS resolve o pipeline corretamente
- Registre os filtros **globais** no `main.ts` após a criação do app:

```typescript
// main.ts
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';

const app = await NestFactory.create(AppModule, { bodyParser: false });

const httpAdapterHost = app.get(HttpAdapterHost);
app.useGlobalFilters(
  new PrismaExceptionFilter(httpAdapterHost),
  new AllExceptionsFilter(httpAdapterHost),
);

// Os filtros são executados na ordem inversa: PrismaExceptionFilter primeiro,
// AllExceptionsFilter como fallback para tudo o mais
```

Ordem de registro importa: PrismaExceptionFilter (específico) deve virar **antes** do AllExceptionsFilter (genérico) na lista de `useGlobalFilters`, porque o NestJS verifica os filtros na ordem inversa — o último registrado é o primeiro executado.