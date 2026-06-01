import { Module } from '@nestjs/common';
import { PresencaService } from './presenca.service';
import { PresencaController } from './presenca.controller';
import { PresencaMqttController } from './presenca-mqtt.controller';
import { PresencaMapper } from 'src/mapper/presencamapper';
import { PrismaModule } from 'src/prisma-modules/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [PresencaService, PresencaMapper],
  controllers: [PresencaController, PresencaMqttController],
  exports: [PresencaService, PresencaMapper],
})
export class PresencaModule {}
