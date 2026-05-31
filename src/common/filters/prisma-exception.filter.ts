import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response, Request } from 'express';
import { Prisma } from '@prisma/client';

const PRISMA_ERROR_MAP: Record<
  string,
  { statusCode: number; message: string }
> = {
  P2002: {
    statusCode: HttpStatus.CONFLICT,
    message: 'Violação de constraint única — registro já existe',
  },
  P2025: {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Registro não encontrado',
  },
  P2003: {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Violação de chave estrangeira — registro relacionado não existe',
  },
  P2014: {
    statusCode: HttpStatus.BAD_REQUEST,
    message:
      'Violação de constraint — exclusão impedida por registros dependentes',
  },
};

type PrismaError =
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientValidationError
  | Prisma.PrismaClientUnknownRequestError
  | Prisma.PrismaClientInitializationError
  | Prisma.PrismaClientRustPanicError;

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientRustPanicError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: PrismaError, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno no banco de dados';

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_ERROR_MAP[exception.code];
      if (mapped) {
        statusCode = mapped.statusCode;
        message = mapped.message;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Dados inválidos para a operação no banco de dados';
    }

    this.logger.error(
      `Prisma error | ${request.method} ${request.url} | ${exception.message.split('\n').pop()?.trim()}`,
    );

    httpAdapter.reply(
      response,
      {
        statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
        error: HttpStatus[statusCode] ?? 'InternalServerError',
      },
      statusCode,
    );
  }
}
