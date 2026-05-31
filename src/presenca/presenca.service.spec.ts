import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PresencaService } from './presenca.service';
import { PresencaMapper } from 'src/mapper/presencamapper';
import { PresencaType } from 'src/model/PresencaModel';
import {
  createPrismaMock,
  prismaMockProvider,
  PrismaMock,
} from 'src/common/testing/prisma-mock';

describe('PresencaService', () => {
  let service: PresencaService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PresencaService, PresencaMapper, prismaMockProvider(prisma)],
    }).compile();
    service = module.get(PresencaService);
  });

  describe('registrarPresenca', () => {
    it('rejeita quando a aula não existe', async () => {
      prisma.aula.findUnique.mockResolvedValue(null);
      await expect(
        service.registrarPresenca('a', 'aula', PresencaType.NFC),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('proíbe registrar em aula fechada', async () => {
      prisma.aula.findUnique.mockResolvedValue({
        id: 'aula',
        materiaId: 'mat',
        status: 'FECHADA',
      });
      await expect(
        service.registrarPresenca('a', 'aula', PresencaType.NFC),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('proíbe quando o aluno não está matriculado', async () => {
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

    it('proíbe quando a matrícula está inativa', async () => {
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

    it('faz upsert da presença quando tudo é válido', async () => {
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

  describe('calcularFrequencia', () => {
    it('retorna 0 quando não há aulas fechadas', async () => {
      prisma.aula.count.mockResolvedValue(0);
      prisma.presenca.count.mockResolvedValue(0);
      const result = await service.calcularFrequencia('a', 'mat');
      expect(result.frequencia).toBe(0);
      expect(result.totalAulasFechadas).toBe(0);
    });

    it('calcula a razão presenças/aulas fechadas', async () => {
      prisma.aula.count.mockResolvedValue(4);
      prisma.presenca.count.mockResolvedValue(3);
      const result = await service.calcularFrequencia('a', 'mat');
      expect(result.frequencia).toBeCloseTo(0.75);
    });
  });

  describe('calcularFaltasDoAluno', () => {
    it('calcula faltas = aulas fechadas - presenças por matéria', async () => {
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
