import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { apiReference } from '@scalar/nestjs-api-reference';
import { generateDocument } from './openapi/openapi';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Required: @thallesp/nestjs-better-auth disables Nest's body parser and
    // installs its own (Better Auth needs the raw request on its routes).
    bodyParser: false,
  });

  // CORS para o app (Expo web/native). Em produção restrinja via CORS_ORIGINS.
  const corsOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  // Ordem importa: o NestJS avalia os filtros globais na ordem inversa do
  // registro (o último registrado é avaliado primeiro). Por isso o
  // PrismaExceptionFilter (específico) deve ser o ÚLTIMO, para ser avaliado
  // antes do AllExceptionsFilter (catch-all) e mapear P2002/P2025/etc.
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost),
    new PrismaExceptionFilter(httpAdapterHost),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const openAPIDocument = await generateDocument(app);

  app.use(
    '/openapi',
    apiReference({
      theme: 'purple',
      content: openAPIDocument,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`🚀 NFC API rodando em http://localhost:${port}`, 'Bootstrap');
  Logger.log(
    `📚 Documentação (Scalar) em http://localhost:${port}/openapi`,
    'Bootstrap',
  );
}
void bootstrap();
