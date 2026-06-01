import { Test, TestingModule } from '@nestjs/testing';
import { PresencaMqttController } from 'src/presenca/presenca-mqtt.controller';
import { PresencaService } from 'src/presenca/presenca.service';
import { PresencaMapper } from 'src/mapper/presencamapper';
import { PresencaModel, PresencaType } from 'src/model/PresencaModel';
import { RedisService } from 'src/redis/redis.service';
import {
  createPrismaMock,
  prismaMockProvider,
  PrismaMock,
} from 'src/common/testing/prisma-mock';

describe('Presenca MQTT E2E (unit-integration)', () => {
  let prisma: PrismaMock;
  let redisSet: jest.Mock;
  let redisGet: jest.Mock;
  let controller: PresencaMqttController;
  let service: PresencaService;

  beforeEach(async () => {
    prisma = createPrismaMock();
    redisSet = jest.fn();
    redisGet = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresencaMqttController],
      providers: [
        PresencaService,
        PresencaMapper,
        prismaMockProvider(prisma),
        {
          provide: RedisService,
          useValue: {
            set: redisSet,
            get: redisGet,
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(PresencaMqttController);
    service = module.get(PresencaService);
  });

  describe('Fluxo completo NFC via MQTT', () => {
    const cardUid = 'NFC-ABC123';
    const receptorId = 'sala-C29';
    const alunoId = 'aluno-001';
    const aulaId = 'aula-001';
    const materiaId = 'mat-001';

    function setupHappyPath() {
      redisSet.mockResolvedValue(true);
      redisGet.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue({ id: alunoId });
      prisma.aula.findFirst.mockResolvedValue({ id: aulaId });
      prisma.aula.findUnique.mockResolvedValue({
        id: aulaId,
        materiaId,
        status: 'ABERTA',
      });
      prisma.matricula.findUnique.mockResolvedValue({
        id: 'matr-1',
        active: true,
      });
      prisma.presenca.upsert.mockResolvedValue({
        id: 'pres-1',
        alunoId,
        aulaId,
        data: new Date(),
        type: 'NFC',
        createdAt: new Date(),
        updatedAt: new Date(),
        aluno: { id: alunoId, name: 'Lucas', RA: '202501' },
      });
    }

    it('registra presenca NFC do payload MQTT ate o upsert no banco', async () => {
      setupHappyPath();

      await controller.handleNfcChamada({ cardUid, receptorId });

      expect(redisSet).toHaveBeenCalledWith(
        `debounce:nfc:${cardUid}:${receptorId}`,
        '1',
        3000,
      );
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { nfcUid: cardUid },
        select: { id: true },
      });
      expect(prisma.presenca.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { alunoId_aulaId: { alunoId, aulaId } },
          create: { alunoId, aulaId, type: PresencaType.NFC },
          update: {},
          select: expect.any(Object),
        }),
      );
    });

    it('bloqueia bip duplicado dentro da janela de debounce (3s)', async () => {
      setupHappyPath();

      await controller.handleNfcChamada({ cardUid, receptorId });
      expect(prisma.presenca.upsert).toHaveBeenCalledTimes(1);

      redisSet.mockResolvedValue(false);

      await controller.handleNfcChamada({ cardUid, receptorId });
      expect(prisma.presenca.upsert).toHaveBeenCalledTimes(1);
    });

    it('ignora payload com cardUid vazio', async () => {
      await controller.handleNfcChamada({ cardUid: '', receptorId });
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('ignora payload com receptorId vazio', async () => {
      await controller.handleNfcChamada({ cardUid: 'ABC', receptorId: '' });
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('retorna silenciosamente quando aluno nao encontrado para nfcUid', async () => {
      redisSet.mockResolvedValue(true);
      prisma.user.findFirst.mockResolvedValue(null);

      await controller.handleNfcChamada({ cardUid: 'UNKNOWN', receptorId });

      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });

    it('retorna silenciosamente quando nao ha aula aberta para a sala', async () => {
      redisSet.mockResolvedValue(true);
      redisGet.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue({ id: alunoId });
      prisma.aula.findFirst.mockResolvedValue(null);

      await controller.handleNfcChamada({ cardUid, receptorId });

      expect(prisma.presenca.upsert).not.toHaveBeenCalled();
    });
  });

  describe('Concorrencia via Promise.all (stress test)', () => {
    it('apenas uma presenca e registrada quando multiplos bipes chegam simultaneamente', async () => {
      const cardUid = 'NFC-STRESS';
      const receptorId = 'sala-STRESS';
      const alunoId = 'aluno-stress';
      const aulaId = 'aula-stress';

      let lockAcquired = true;
      redisSet.mockImplementation(() => {
        if (lockAcquired) {
          lockAcquired = false;
          return true;
        }
        return false;
      });
      redisGet.mockResolvedValue(aulaId);
      prisma.user.findFirst.mockResolvedValue({ id: alunoId });

      const results = await Promise.all(
        Array.from({ length: 5 }, () =>
          service
            .registrarViaNfcHardware(cardUid, receptorId)
            .catch(() => null),
        ),
      );

      const successful = results.filter((r): r is PresencaModel => r !== null);
      expect(successful.length).toBeLessThanOrEqual(1);
    });
  });
});
