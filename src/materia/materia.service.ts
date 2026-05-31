import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma-modules/prisma/prisma';
import { MateriaMapper } from 'src/mapper/materiamapper';
import { MateriaModel } from 'src/model/MateriaModel';
import { CreateMateriaDTO } from 'src/dto/materia/CreateMateriaDTO';

const MATERIA_SELECT = {
  id: true,
  codigo: true,
  nome: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class MateriaService {
  constructor(
    private prismaService: PrismaService,
    private materiaMapper: MateriaMapper,
  ) {}

  async criarMateria(dto: CreateMateriaDTO): Promise<MateriaModel> {
    const existente = await this.prismaService.materia.findUnique({
      where: { codigo: dto.codigo },
      select: { id: true },
    });

    if (existente) {
      throw new BadRequestException('Já existe uma matéria com este código');
    }

    const prismaMateria = await this.prismaService.materia.create({
      data: {
        codigo: dto.codigo,
        nome: dto.nome,
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

    if (!prismaMateria) {
      return null;
    }

    return this.materiaMapper.toMateriaModel(prismaMateria);
  }

  async listarTodas(): Promise<MateriaModel[]> {
    const materias = await this.prismaService.materia.findMany({
      select: MATERIA_SELECT,
    });

    return materias.map((m) => this.materiaMapper.toMateriaModel(m));
  }
}
