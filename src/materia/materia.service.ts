import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma-modules/prisma/prisma';
import { MateriaMapper } from 'src/mapper/materiamapper';
import { MateriaModel } from 'src/model/MateriaModel';
import { CreateMateriaDTO } from 'src/dto/materia/CreateMateriaDTO';

const MATERIA_SELECT = {
  id: true,
  codigo: true,
  nome: true,
  faltaLimite: true,
  professorId: true,
  createdAt: true,
  updatedAt: true,
  professor: { select: { name: true } },
} as const;

@Injectable()
export class MateriaService {
  constructor(
    private prismaService: PrismaService,
    private materiaMapper: MateriaMapper,
  ) {}

  async criarMateria(
    dto: CreateMateriaDTO,
    professorIdFallback?: string,
  ): Promise<MateriaModel> {
    const existente = await this.prismaService.materia.findUnique({
      where: { codigo: dto.codigo },
      select: { id: true },
    });

    if (existente) {
      throw new BadRequestException('Já existe uma matéria com este código');
    }

    const professorId = dto.professorId ?? professorIdFallback ?? null;

    if (professorId) {
      const professor = await this.prismaService.user.findUnique({
        where: { id: professorId },
        select: { id: true, role: true },
      });

      if (!professor) {
        throw new NotFoundException('Professor não encontrado');
      }
      if (professor.role !== 'TEACHER') {
        throw new BadRequestException('O usuário informado não é um professor');
      }
    }

    const prismaMateria = await this.prismaService.materia.create({
      data: {
        codigo: dto.codigo,
        nome: dto.nome,
        faltaLimite: dto.faltaLimite,
        professorId,
      },
      select: MATERIA_SELECT,
    });

    return this.materiaMapper.toMateriaModel(prismaMateria);
  }

  async buscarPorId(id: string): Promise<MateriaModel | null> {
    const prismaMateria = await this.prismaService.materia.findUnique({
      where: { id },
      select: MATERIA_SELECT,
    });

    return prismaMateria
      ? this.materiaMapper.toMateriaModel(prismaMateria)
      : null;
  }

  async buscarPorIdOuFalha(id: string): Promise<MateriaModel> {
    const materia = await this.buscarPorId(id);
    if (!materia) {
      throw new NotFoundException('Matéria não encontrada');
    }
    return materia;
  }

  async listarTodas(): Promise<MateriaModel[]> {
    const materias = await this.prismaService.materia.findMany({
      select: MATERIA_SELECT,
      orderBy: { nome: 'asc' },
    });

    return materias.map((m) => this.materiaMapper.toMateriaModel(m));
  }
}
