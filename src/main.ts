import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { apiReference } from '@scalar/nestjs-api-reference';
import { generateDocument } from './openapi/openapi';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { getCleanOrigins } from 'src/utils/cors.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const mqttBrokerUrl = process.env.MQTT_BROKER_URL ?? 'mqtt://localhost:1883';
  app.connectMicroservice({
    transport: Transport.MQTT,
    options: { url: mqttBrokerUrl },
  });

  const isDevelopment = process.env.NODE_ENV === 'development';
  const corsOrigins = getCleanOrigins(process.env.CORS_ORIGINS);

  app.enableCors({
    origin: isDevelopment ? true : corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  const httpAdapterHost = app.get(HttpAdapterHost);

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
  await app.startAllMicroservices();
  Logger.log(`MQTT microservice connected to ${mqttBrokerUrl}`, 'Bootstrap');
  await app.listen(port);
  Logger.log(`NFC API rodando em http://localhost:${port}`, 'Bootstrap');
  Logger.log(
    `Documentacao (Scalar) em http://localhost:${port}/openapi`,
    'Bootstrap',
  );
}
void bootstrap();
