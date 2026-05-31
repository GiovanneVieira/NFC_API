import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma-modules/prisma/prisma';
import { AulaMapper } from 'src/mapper/aulamapper';
import { AulaModel, AulaStatus } from 'src/model/AulaModel';
import { CreateAulaDTO } from 'src/dto/aula/CreateAulaDTO';

const AULA_SELECT = {
  id: true,
  materiaId: true,
  dataHora: true,
  sala: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  materia: {
    select: {
      nome: true,
      professor: { select: { name: true } },
    },
  },
} as const;

@Injectable()
export class AulaService {
  constructor(
    private prismaService: PrismaService,
    private aulaMapper: AulaMapper,
  ) {}

  async criarAula(dto: CreateAulaDTO): Promise<AulaModel> {
    const materia = await this.prismaService.materia.findUnique({
      where: { id: dto.materiaId },
      select: { id: true },
    });

    if (!materia) {
      throw new NotFoundException('Matéria não encontrada');
    }

    const prismaAula = await this.prismaService.aula.create({
      data: {
        materiaId: dto.materiaId,
        dataHora: new Date(dto.dataHora),
        sala: dto.sala,
        status: dto.status ?? AulaStatus.ABERTA,
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

    return prismaAula ? this.aulaMapper.toAulaModel(prismaAula) : null;
  }

  async buscarPorIdOuFalha(id: string): Promise<AulaModel> {
    const aula = await this.buscarPorId(id);
    if (!aula) {
      throw new NotFoundException('Aula não encontrada');
    }
    return aula;
  }

  async listarPorMateria(materiaId: string): Promise<AulaModel[]> {
    const aulas = await this.prismaService.aula.findMany({
      where: { materiaId },
      select: AULA_SELECT,
      orderBy: { dataHora: 'asc' },
    });

    return aulas.map((a) => this.aulaMapper.toAulaModel(a));
  }

  /** Aulas das matérias em que o aluno está matriculado (tela de Aulas do app). */
  async listarParaAluno(alunoId: string): Promise<AulaModel[]> {
    const matriculas = await this.prismaService.matricula.findMany({
      where: { alunoId, active: true },
      select: { materiaId: true },
    });

    const materiaIds = matriculas.map((m) => m.materiaId);
    if (materiaIds.length === 0) {
      return [];
    }

    const aulas = await this.prismaService.aula.findMany({
      where: { materiaId: { in: materiaIds } },
      select: AULA_SELECT,
      orderBy: { dataHora: 'asc' },
    });

    return aulas.map((a) => this.aulaMapper.toAulaModel(a));
  }

  async fecharAula(id: string): Promise<AulaModel> {
    await this.buscarPorIdOuFalha(id);

    const prismaAula = await this.prismaService.aula.update({
      where: { id },
      data: { status: AulaStatus.FECHADA },
      select: AULA_SELECT,
    });

    return this.aulaMapper.toAulaModel(prismaAula);
  }
}
