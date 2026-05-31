import { Module } from '@nestjs/common';
import { AulaService } from './aula.service';
import { AulaController } from './aula.controller';
import { AulaMapper } from 'src/mapper/aulamapper';
import { PrismaModule } from 'src/prisma-modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AulaService, AulaMapper],
  controllers: [AulaController],
  exports: [AulaService, AulaMapper],
})
export class AulaModule {}
