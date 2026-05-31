import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { PrismaModule } from './prisma-modules/prisma/prisma.module';
import { MateriaModule } from './materia/materia.module';
import { AulaModule } from './aula/aula.module';
import { PresencaModule } from './presenca/presenca.module';
import { MatriculaModule } from './matricula/matricula.module';
import { NotaModule } from './nota/nota.module';
import { auth } from './auth/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule.forRoot({
      auth,
    }),
    UserModule,
    MateriaModule,
    AulaModule,
    PresencaModule,
    MatriculaModule,
    NotaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
