import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MatriculaService } from './matricula.service';
import { MatriculaMapper } from 'src/mapper/matriculamapper';
import {
  createPrismaMock,
  prismaMockProvider,
  PrismaMock,
} from 'src/common/testing/prisma-mock';

const detail = (over: Partial<any> = {}) => ({
  id: 'm1',
  alunoId: 'a',
  materiaId: 'mat',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...over,
});

describe('MatriculaService', () => {
  let service: MatriculaService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatriculaService,
        MatriculaMapper,
        prismaMockProvider(prisma),
      ],
    }).compile();
    service = module.get(MatriculaService);
  });

  describe('matricular', () => {
    it('lança NotFound quando o aluno não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.matricular({ alunoId: 'a', materiaId: 'mat' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lança NotFound quando a matéria não existe', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'a', role: 'STUDENT' });
      prisma.materia.findUnique.mockResolvedValue(null);
      await expect(
        service.matricular({ alunoId: 'a', materiaId: 'mat' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejeita matrícula já ativa', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'a', role: 'STUDENT' });
      prisma.materia.findUnique.mockResolvedValue({ id: 'mat' });
      prisma.matricula.findUnique.mockResolvedValue({ id: 'm1', active: true });
      await expect(
        service.matricular({ alunoId: 'a', materiaId: 'mat' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('reativa matrícula inativa existente', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'a', role: 'STUDENT' });
      prisma.materia.findUnique.mockResolvedValue({ id: 'mat' });
      prisma.matricula.findUnique.mockResolvedValue({
        id: 'm1',
        active: false,
      });
      prisma.matricula.update.mockResolvedValue(detail({ active: true }));

      const result = await service.matricular({
        alunoId: 'a',
        materiaId: 'mat',
      });
      expect(prisma.matricula.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { active: true } }),
      );
      expect(result.active).toBe(true);
      expect(prisma.matricula.create).not.toHaveBeenCalled();
    });

    it('cria nova matrícula quando não existe', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'a', role: 'STUDENT' });
      prisma.materia.findUnique.mockResolvedValue({ id: 'mat' });
      prisma.matricula.findUnique.mockResolvedValue(null);
      prisma.matricula.create.mockResolvedValue(detail());

      const result = await service.matricular({
        alunoId: 'a',
        materiaId: 'mat',
      });
      expect(prisma.matricula.create).toHaveBeenCalled();
      expect(result.id).toBe('m1');
    });
  });

  describe('desmatricular', () => {
    it('lança NotFound quando não há matrícula', async () => {
      prisma.matricula.findUnique.mockResolvedValue(null);
      await expect(service.desmatricular('a', 'mat')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('desativa a matrícula', async () => {
      prisma.matricula.findUnique.mockResolvedValue({ id: 'm1', active: true });
      prisma.matricula.update.mockResolvedValue(detail({ active: false }));
      const result = await service.desmatricular('a', 'mat');
      expect(result.active).toBe(false);
    });
  });

  describe('listarPorAluno', () => {
    it('lista matrículas ativas com a matéria', async () => {
      prisma.matricula.findMany.mockResolvedValue([
        detail({ materia: { id: 'mat', codigo: 'E1', nome: 'Eng' } }),
      ]);
      const result = await service.listarPorAluno('a');
      expect(result).toHaveLength(1);
      expect(result[0].materiaNome).toBe('Eng');
    });
  });
});
