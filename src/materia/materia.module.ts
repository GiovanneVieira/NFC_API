import { Module } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { MateriaController } from './materia.controller';
import { MateriaMapper } from 'src/mapper/materiamapper';
import { PrismaModule } from 'src/prisma-modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MateriaService, MateriaMapper],
  controllers: [MateriaController],
  exports: [MateriaService, MateriaMapper],
})
export class MateriaModule {}
