import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma-modules/prisma/prisma';
import { AulaMapper } from 'src/mapper/aulamapper';
import { AulaModel, AulaStatus } from 'src/model/AulaModel';
import { CreateAulaDTO } from 'src/dto/aula/CreateAulaDTO';

const AULA_SELECT = {
  id: true,
  materiaId: true,
  dataHora: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

const MATERIA_EXISTS_SELECT = { id: true } as const;

@Injectable()
export class AulaService {
  constructor(
    private prismaService: PrismaService,
    private aulaMapper: AulaMapper,
  ) {}

  async criarAula(dto: CreateAulaDTO): Promise<AulaModel> {
    const materia = await this.prismaService.materia.findUnique({
      where: { id: dto.materiaId },
      select: MATERIA_EXISTS_SELECT,
    });

    if (!materia) {
      throw new NotFoundException('Matéria não encontrada');
    }

    const prismaAula = await this.prismaService.aula.create({
      data: {
        materiaId: dto.materiaId,
        dataHora: new Date(dto.dataHora),
        status: dto.status,
      },
      select: AULA_SELECT,
    });

    return this.aulaMapper.toAulaModel(prismaAula);
  }

  async buscarPorId(id: string): Promise<AulaModel | null> {
    const prismaAula = await this.prismaService.aula.findUnique({
      where: { id },
      select: AULA_SELECT,
    });

    if (!prismaAula) {
      return null;
    }

    return this.aulaMapper.toAulaModel(prismaAula);
  }

  async listarPorMateria(materiaId: string): Promise<AulaModel[]> {
    const aulas = await this.prismaService.aula.findMany({
      where: { materiaId },
      select: AULA_SELECT,
    });

    return aulas.map((a) => this.aulaMapper.toAulaModel(a));
  }

  async fecharAula(id: string): Promise<AulaModel> {
    const aula = await this.prismaService.aula.findUnique({
      where: { id },
      select: AULA_SELECT,
    });

    if (!aula) {
      throw new NotFoundException('Aula não encontrada');
    }

    const prismaAula = await this.prismaService.aula.update({
      where: { id },
      data: { status: AulaStatus.FECHADA },
      select: AULA_SELECT,
    });

    return this.aulaMapper.toAulaModel(prismaAula);
  }
}
