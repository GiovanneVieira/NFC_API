import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response, Request } from 'express';

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

function isPrismaError(
  exception: unknown,
): exception is Error & { code: string } {
  return (
    exception instanceof Error &&
    'code' in exception &&
    typeof exception.code === 'string' &&
    (exception as Error & { code: string }).code.startsWith('P')
  );
}

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (!isPrismaError(exception)) {
      throw exception;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const mapped = PRISMA_ERROR_MAP[exception.code];

    const statusCode = mapped?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message = mapped?.message ?? 'Erro interno no banco de dados';

    this.logger.error(
      `Prisma error ${exception.code} | ${request.method} ${request.url} | ${exception.message}`,
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
