import { Module } from '@nestjs/common';
import { NotaService } from './nota.service';
import { NotaController } from './nota.controller';
import { NotaMapper } from 'src/mapper/notamapper';
import { PrismaModule } from 'src/prisma-modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NotaService, NotaMapper],
  controllers: [NotaController],
  exports: [NotaService],
})
export class NotaModule {}
