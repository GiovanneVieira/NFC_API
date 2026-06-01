import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PresencaService } from './presenca.service';
import { PresencaMapper } from 'src/mapper/presencamapper';
import { PresencaType } from 'src/model/PresencaModel';
import { RedisService } from 'src/redis/redis.service';
import {
  createPrismaMock,
  prismaMockProvider,
  PrismaMock,
} from 'src/common/testing/prisma-mock';

const mockRedisService = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};

describe('PresencaService', () => {
  let service: PresencaService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresencaService,
        PresencaMapper,
        prismaMockProvider(prisma),
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();
    service = module.get(PresencaService);
  });

  describe('registrarPresenca', () => {
    it('rejeita quando a aula nao existe', async () => {
      prisma.aula.findUnique.mockResolvedValue(null);
      await expect(
        service.registrarPresenca('a', 'aula', PresencaType.NFC),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('probe registrar em aula fechada', async () => {
      prisma.aula.findUnique.mockResolvedValue({
        id: 'aula',
        materiaId: 'mat',
        status: 'FECHADA',
      });
      await expect(
        service.registrarPresenca('a', 'aula', PresencaType.NFC),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('probe quando o aluno nao esta matriculado', async () => {
      prisma.aula.findUnique.mockResolvedValue({
        id: 'aula',
        materiaId: 'mat',
        status: 'ABERTA',
      });
      prisma.matricula.findUnique.mockResolvedValue(null);
      await expect(
        service.registrarPresenca('a', 'aula', PresencaType.NFC),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('probe quando a matricula esta inativa', async () => {
      prisma.aula.findUnique.mockResolvedValue({
        id: 'aula',
        materiaId: 'mat',
        status: 'ABERTA',
      });
      prisma.matricula.findUnique.mockResolvedValue({ id: 'm', active: false });
      await expect(
        service.registrarPresenca('a', 'aula', PresencaType.NFC),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('faz upsert da presenca quando tudo e valido', async () => {
      prisma.aula.findUnique.mockResolvedValue({
        id: 'aula',
        materiaId: 'mat',
        status: 'ABERTA',
      });
      prisma.matricula.findUnique.mockResolvedValue({ id: 'm', active: true });
      prisma.presenca.upsert.mockResolvedValue({
        id: 'p1',
        alunoId: 'a',
        aulaId: 'aula',
        data: new Date(),
        type: 'NFC',
        createdAt: new Date(),
        updatedAt: new Date(),
        aluno: { id: 'a', name: 'Lucas', RA: '202501' },
      });

      const result = await service.registrarPresenca(
        'a',
        'aula',
        PresencaType.NFC,
      );
      expect(result.alunoId).toBe('a');
      expect(result.alunoName).toBe('Lucas');
      expect(prisma.presenca.upsert).toHaveBeenCalled();
    });
  });

  describe('registrarViaNfcHardware', () => {
    it('retorna null quando debounce bloqueia (Redis SET falha)', async () => {
      mockRedisService.set.mockResolvedValue(false);

      const result = await service.registrarViaNfcHardware('CARD1', 'sala-01');

      expect(result).toBeNull();
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('retorna null quando nenhum aluno corresponde ao nfcUid', async () => {
      mockRedisService.set.mockResolvedValue(true);
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await service.registrarViaNfcHardware(
        'UNKNOWN',
        'sala-01',
      );

      expect(result).toBeNull();
    });

    it('retorna null quando nao ha aula aberta para a sala', async () => {
      mockRedisService.set.mockResolvedValue(true);
      prisma.user.findFirst.mockResolvedValue({ id: 'aluno-1' });
      prisma.aula.findFirst.mockResolvedValue(null);
      mockRedisService.get.mockResolvedValue(null);

      const result = await service.registrarViaNfcHardware('CARD1', 'sala-01');

      expect(result).toBeNull();
    });

    it('usa aula do cache Redis quando disponivel', async () => {
      mockRedisService.set.mockResolvedValue(true);
      mockRedisService.get.mockResolvedValue('aula-cached');
      prisma.user.findFirst.mockResolvedValue({ id: 'aluno-1' });

      prisma.aula.findUnique.mockResolvedValue({
        id: 'aula-cached',
        materiaId: 'mat',
        status: 'ABERTA',
      });
      prisma.matricula.findUnique.mockResolvedValue({ id: 'm', active: true });
      prisma.presenca.upsert.mockResolvedValue({
        id: 'p1',
        alunoId: 'aluno-1',
        aulaId: 'aula-cached',
        data: new Date(),
        type: 'NFC',
        createdAt: new Date(),
        updatedAt: new Date(),
        aluno: { id: 'aluno-1', name: 'Lucas', RA: '202501' },
      });

      const result = await service.registrarViaNfcHardware('CARD1', 'sala-01');

      expect(prisma.aula.findFirst).not.toHaveBeenCalled();
      expect(result!.alunoId).toBe('aluno-1');
    });

    it('faz fallback para Prisma quando cache esta vazio e registra presenca', async () => {
      mockRedisService.set.mockResolvedValue(true);
      mockRedisService.get.mockResolvedValueOnce(null);

      prisma.user.findFirst.mockResolvedValue({ id: 'aluno-1' });
      prisma.aula.findFirst.mockResolvedValue({ id: 'aula-01' });

      prisma.aula.findUnique.mockResolvedValue({
        id: 'aula-01',
        materiaId: 'mat',
        status: 'ABERTA',
      });
      prisma.matricula.findUnique.mockResolvedValue({ id: 'm', active: true });
      prisma.presenca.upsert.mockResolvedValue({
        id: 'p1',
        alunoId: 'aluno-1',
        aulaId: 'aula-01',
        data: new Date(),
        type: 'NFC',
        createdAt: new Date(),
        updatedAt: new Date(),
        aluno: { id: 'aluno-1', name: 'Lucas', RA: '202501' },
      });

      const result = await service.registrarViaNfcHardware('CARD1', 'sala-01');

      expect(prisma.aula.findFirst).toHaveBeenCalledWith({
        where: { sala: 'sala-01', status: 'ABERTA' },
        select: { id: true },
        orderBy: { dataHora: 'desc' },
      });
      expect(mockRedisService.set).toHaveBeenCalledWith(
        expect.stringContaining('aula:ativa:sala-01'),
        'aula-01',
        300_000,
      );
      expect(result!.alunoId).toBe('aluno-1');
    });
  });

  describe('calcularFrequencia', () => {
    it('retorna 0 quando nao ha aulas fechadas', async () => {
      prisma.aula.count.mockResolvedValue(0);
      prisma.presenca.count.mockResolvedValue(0);
      const result = await service.calcularFrequencia('a', 'mat');
      expect(result.frequencia).toBe(0);
      expect(result.totalAulasFechadas).toBe(0);
    });

    it('calcula a razao presencas/aulas fechadas', async () => {
      prisma.aula.count.mockResolvedValue(4);
      prisma.presenca.count.mockResolvedValue(3);
      const result = await service.calcularFrequencia('a', 'mat');
      expect(result.frequencia).toBeCloseTo(0.75);
    });
  });

  describe('calcularFaltasDoAluno', () => {
    it('calcula faltas = aulas fechadas - presencas por materia', async () => {
      prisma.matricula.findMany.mockResolvedValue([
        {
          materiaId: 'mat-1',
          materia: { nome: 'Eng', codigo: 'E1', faltaLimite: 19 },
        },
      ]);
      prisma.aula.count.mockResolvedValue(5);
      prisma.presenca.count.mockResolvedValue(3);

      const result = await service.calcularFaltasDoAluno('a');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        materiaId: 'mat-1',
        materiaNome: 'Eng',
        codigo: 'E1',
        faltas: 2,
        limite: 19,
      });
    });
  });
});
