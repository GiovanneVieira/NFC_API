import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MateriaService } from './materia.service';
import { MateriaMapper } from 'src/mapper/materiamapper';
import {
  createPrismaMock,
  prismaMockProvider,
  PrismaMock,
} from 'src/common/testing/prisma-mock';

const materiaRow = (over: Partial<any> = {}) => ({
  id: 'mat-1',
  codigo: 'ENG101',
  nome: 'Engenharia',
  faltaLimite: 19,
  professorId: 'prof-1',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  professor: { name: 'Prof Eliane' },
  ...over,
});

describe('MateriaService', () => {
  let service: MateriaService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [MateriaService, MateriaMapper, prismaMockProvider(prisma)],
    }).compile();
    service = module.get(MateriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('criarMateria', () => {
    it('rejeita código duplicado', async () => {
      prisma.materia.findUnique.mockResolvedValue({ id: 'existe' });
      await expect(
        service.criarMateria({ codigo: 'ENG101', nome: 'X' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('cria com o professor autenticado (fallback) e mapeia o nome', async () => {
      prisma.materia.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({
        id: 'prof-1',
        role: 'TEACHER',
      });
      prisma.materia.create.mockResolvedValue(materiaRow());

      const result = await service.criarMateria(
        { codigo: 'ENG101', nome: 'Engenharia' },
        'prof-1',
      );

      expect(prisma.materia.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ professorId: 'prof-1' }),
        }),
      );
      expect(result.professorNome).toBe('Prof Eliane');
      expect(result.faltaLimite).toBe(19);
    });

    it('rejeita quando o professorId informado não existe', async () => {
      prisma.materia.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.criarMateria({ codigo: 'X', nome: 'Y', professorId: 'nope' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejeita quando o usuário informado não é professor', async () => {
      prisma.materia.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({ id: 'u', role: 'STUDENT' });
      await expect(
        service.criarMateria({ codigo: 'X', nome: 'Y', professorId: 'u' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('buscarPorIdOuFalha', () => {
    it('lança NotFound quando não existe', async () => {
      prisma.materia.findUnique.mockResolvedValue(null);
      await expect(service.buscarPorIdOuFalha('x')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('retorna a matéria quando existe', async () => {
      prisma.materia.findUnique.mockResolvedValue(materiaRow());
      const result = await service.buscarPorIdOuFalha('mat-1');
      expect(result.id).toBe('mat-1');
    });
  });

  describe('listarTodas', () => {
    it('mapeia todas as matérias', async () => {
      prisma.materia.findMany.mockResolvedValue([
        materiaRow(),
        materiaRow({ id: 'mat-2' }),
      ]);
      const result = await service.listarTodas();
      expect(result).toHaveLength(2);
      expect(result[1].id).toBe('mat-2');
    });
  });
});
