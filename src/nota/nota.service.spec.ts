import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NotaService } from './nota.service';
import { NotaMapper } from 'src/mapper/notamapper';
import {
  createPrismaMock,
  prismaMockProvider,
  PrismaMock,
} from 'src/common/testing/prisma-mock';

const notaRow = (over: Partial<any> = {}) => ({
  id: 'n1',
  alunoId: 'a',
  materiaId: 'mat',
  term: '2026/01',
  ac1: 8.6,
  ac2: null,
  af: null,
  sub: null,
  ag: null,
  media: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  materia: { nome: 'Eng', codigo: 'E1' },
  ...over,
});

describe('NotaService', () => {
  let service: NotaService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotaService, NotaMapper, prismaMockProvider(prisma)],
    }).compile();
    service = module.get(NotaService);
  });

  describe('upsertNota', () => {
    it('lança NotFound quando o aluno não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.materia.findUnique.mockResolvedValue({ id: 'mat' });
      await expect(
        service.upsertNota({ alunoId: 'a', materiaId: 'mat', term: '2026/01' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lança NotFound quando a matéria não existe', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'a' });
      prisma.materia.findUnique.mockResolvedValue(null);
      await expect(
        service.upsertNota({ alunoId: 'a', materiaId: 'mat', term: '2026/01' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('faz upsert e mapeia a resposta', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'a' });
      prisma.materia.findUnique.mockResolvedValue({ id: 'mat' });
      prisma.nota.upsert.mockResolvedValue(notaRow());

      const result = await service.upsertNota({
        alunoId: 'a',
        materiaId: 'mat',
        term: '2026/01',
        ac1: 8.6,
      });
      expect(prisma.nota.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            alunoId_materiaId_term: {
              alunoId: 'a',
              materiaId: 'mat',
              term: '2026/01',
            },
          },
        }),
      );
      expect(result.ac1).toBe(8.6);
      expect(result.materiaNome).toBe('Eng');
    });
  });

  describe('listarPorAluno', () => {
    it('filtra por term quando informado', async () => {
      prisma.nota.findMany.mockResolvedValue([notaRow()]);
      await service.listarPorAluno('a', '2026/01');
      expect(prisma.nota.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { alunoId: 'a', term: '2026/01' } }),
      );
    });

    it('sem term lista todas', async () => {
      prisma.nota.findMany.mockResolvedValue([
        notaRow(),
        notaRow({ id: 'n2' }),
      ]);
      const result = await service.listarPorAluno('a');
      expect(prisma.nota.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { alunoId: 'a' } }),
      );
      expect(result).toHaveLength(2);
    });
  });
});
