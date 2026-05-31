import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { apiReference } from '@scalar/nestjs-api-reference';
import { generateDocument } from './openapi/openapi';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new PrismaExceptionFilter(httpAdapterHost),
    new AllExceptionsFilter(httpAdapterHost),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const openAPIDocument = await generateDocument(app);

  app.use(
    '/openapi',
    apiReference({
      theme: 'purple',
      content: openAPIDocument,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
