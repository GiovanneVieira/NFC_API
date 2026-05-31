import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { auth } from 'src/auth/auth';

const config = new DocumentBuilder()
  .setTitle('NFC API')
  .setVersion('1.0')
  .addTag('NFC')
  .build();

export const generateDocument = async (app: INestApplication<any>) => {
  const nestDocument = SwaggerModule.createDocument(app, config);
  const betterAuthSchema = await auth.api.generateOpenAPISchema();

  const authSection = 'Auth';

  if (betterAuthSchema?.paths) {
    const metodos = ['get', 'post', 'put', 'delete', 'patch'] as const;
    const paths = betterAuthSchema.paths as Record<
      string,
      Record<string, { tags?: string[] } | undefined>
    >;

    Object.values(paths).forEach((pathItem) => {
      metodos.forEach((metodo) => {
        const operation = pathItem[metodo];
        if (operation) {
          operation.tags = [authSection];
        }
      });
    });
  }

  const combinedDocument = {
    ...nestDocument,
    paths: {
      ...nestDocument.paths,
      ...betterAuthSchema?.paths,
    },
    components: {
      ...nestDocument?.components,
      ...betterAuthSchema?.components,
      schemas: {
        ...nestDocument?.components?.schemas,
        ...betterAuthSchema?.components?.schemas,
      },
    },
  };
  return combinedDocument;
};
