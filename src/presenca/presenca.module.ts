import { Module } from '@nestjs/common';
import { PresencaService } from './presenca.service';
import { PresencaController } from './presenca.controller';
import { PresencaMapper } from 'src/mapper/presencamapper';
import { PrismaModule } from 'src/prisma-modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PresencaService, PresencaMapper],
  controllers: [PresencaController],
  exports: [PresencaService, PresencaMapper],
})
export class PresencaModule {}
