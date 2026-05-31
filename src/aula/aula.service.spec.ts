import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AulaService } from './aula.service';
import { AulaMapper } from 'src/mapper/aulamapper';
import { AulaStatus } from 'src/model/AulaModel';
import {
  createPrismaMock,
  prismaMockProvider,
  PrismaMock,
} from 'src/common/testing/prisma-mock';

const aulaRow = (over: Partial<any> = {}) => ({
  id: 'aula-1',
  materiaId: 'mat-1',
  dataHora: new Date('2026-05-31T19:00:00Z'),
  sala: 'C29',
  status: 'ABERTA',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  materia: { nome: 'Engenharia', professor: { name: 'Prof' } },
  ...over,
});

describe('AulaService', () => {
  let service: AulaService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AulaService, AulaMapper, prismaMockProvider(prisma)],
    }).compile();
    service = module.get(AulaService);
  });

  describe('criarAula', () => {
    it('rejeita quando a matéria não existe', async () => {
      prisma.materia.findUnique.mockResolvedValue(null);
      await expect(
        service.criarAula({ materiaId: 'x', dataHora: '2026-05-31T19:00:00Z' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('cria com status ABERTA por padrão e mapeia matéria/professor', async () => {
      prisma.materia.findUnique.mockResolvedValue({ id: 'mat-1' });
      prisma.aula.create.mockResolvedValue(aulaRow());

      const result = await service.criarAula({
        materiaId: 'mat-1',
        dataHora: '2026-05-31T19:00:00Z',
        sala: 'C29',
      });

      expect(prisma.aula.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: AulaStatus.ABERTA,
            sala: 'C29',
          }),
        }),
      );
      expect(result.materiaNome).toBe('Engenharia');
      expect(result.professorNome).toBe('Prof');
    });
  });

  describe('fecharAula', () => {
    it('lança NotFound quando a aula não existe', async () => {
      prisma.aula.findUnique.mockResolvedValue(null);
      await expect(service.fecharAula('x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('atualiza o status para FECHADA', async () => {
      prisma.aula.findUnique.mockResolvedValue(aulaRow());
      prisma.aula.update.mockResolvedValue(aulaRow({ status: 'FECHADA' }));
      const result = await service.fecharAula('aula-1');
      expect(prisma.aula.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: AulaStatus.FECHADA } }),
      );
      expect(result.status).toBe(AulaStatus.FECHADA);
    });
  });

  describe('listarParaAluno', () => {
    it('retorna vazio quando o aluno não tem matrículas ativas', async () => {
      prisma.matricula.findMany.mockResolvedValue([]);
      const result = await service.listarParaAluno('aluno-1');
      expect(result).toEqual([]);
      expect(prisma.aula.findMany).not.toHaveBeenCalled();
    });

    it('busca aulas das matérias matriculadas', async () => {
      prisma.matricula.findMany.mockResolvedValue([
        { materiaId: 'mat-1' },
        { materiaId: 'mat-2' },
      ]);
      prisma.aula.findMany.mockResolvedValue([aulaRow()]);
      const result = await service.listarParaAluno('aluno-1');
      expect(prisma.aula.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { materiaId: { in: ['mat-1', 'mat-2'] } },
        }),
      );
      expect(result).toHaveLength(1);
    });
  });
});
