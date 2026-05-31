import { Module } from '@nestjs/common';
import { MatriculaService } from './matricula.service';
import { MatriculaController } from './matricula.controller';
import { MatriculaMapper } from 'src/mapper/matriculamapper';
import { PrismaModule } from 'src/prisma-modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MatriculaService, MatriculaMapper],
  controllers: [MatriculaController],
  exports: [MatriculaService, MatriculaMapper],
})
export class MatriculaModule {}
