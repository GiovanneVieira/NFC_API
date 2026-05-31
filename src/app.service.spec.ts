import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import {
  createPrismaMock,
  prismaMockProvider,
  PrismaMock,
} from 'src/common/testing/prisma-mock';

describe('AppService', () => {
  let service: AppService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService, prismaMockProvider(prisma)],
    }).compile();
    service = module.get(AppService);
  });

  it('getHello retorna "Hello World!"', () => {
    expect(service.getHello()).toBe('Hello World!');
  });

  describe('health', () => {
    it('status ok quando o banco responde', async () => {
      prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      const result = await service.health();
      expect(result).toMatchObject({ status: 'ok', database: 'up' });
      expect(result.timestamp).toBeDefined();
    });

    it('status degraded quando o banco falha', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
      const result = await service.health();
      expect(result).toMatchObject({ status: 'degraded', database: 'down' });
    });
  });
});
