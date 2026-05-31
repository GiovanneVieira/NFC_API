import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma-modules/prisma/prisma';
import { PresencaMapper } from 'src/mapper/presencamapper';
import { PresencaModel, PresencaType } from 'src/model/PresencaModel';
import { FrequenciaResponseDTO } from 'src/dto/presenca/FrequenciaResponseDTO';
import { FaltaResponseDTO } from 'src/dto/presenca/FaltaResponseDTO';

const PRESENCA_SELECT = {
  id: true,
  alunoId: true,
  aulaId: true,
  data: true,
  type: true,
  createdAt: true,
  updatedAt: true,
  aluno: {
    select: { id: true, name: true, RA: true },
  },
} as const;

@Injectable()
export class PresencaService {
  private readonly logger = new Logger(PresencaService.name);

  constructor(
    private prismaService: PrismaService,
    private presencaMapper: PresencaMapper,
  ) {}

  async registrarPresenca(
    alunoId: string,
    aulaId: string,
    type: PresencaType,
  ): Promise<PresencaModel> {
    const aula = await this.prismaService.aula.findUnique({
      where: { id: aulaId },
      select: { id: true, materiaId: true, status: true },
    });

    if (!aula) {
      throw new BadRequestException('Aula não encontrada');
    }

    if (aula.status === 'FECHADA') {
      throw new ForbiddenException(
        'Não é possível registrar presença em uma aula fechada',
      );
    }

    const matricula = await this.prismaService.matricula.findUnique({
      where: {
        alunoId_materiaId: {
          alunoId,
          materiaId: aula.materiaId,
        },
      },
      select: { id: true, active: true },
    });

    if (!matricula || !matricula.active) {
      throw new ForbiddenException('Aluno não está matriculado nesta matéria');
    }

    const prismaPresenca = await this.prismaService.presenca.upsert({
      where: {
        alunoId_aulaId: { alunoId, aulaId },
      },
      create: { alunoId, aulaId, type },
      update: {},
      select: PRESENCA_SELECT,
    });

    this.logger.log(
      `Presença registrada: aluno=${alunoId} aula=${aulaId} tipo=${type}`,
    );

    return this.presencaMapper.toPresencaModelWithAluno(prismaPresenca);
  }

  async calcularFrequencia(
    alunoId: string,
    materiaId: string,
  ): Promise<FrequenciaResponseDTO> {
    const [totalAulasFechadas, totalPresencas] = await Promise.all([
      this.prismaService.aula.count({
        where: { materiaId, status: 'FECHADA' },
      }),
      this.prismaService.presenca.count({
        where: {
          alunoId,
          aula: { materiaId, status: 'FECHADA' },
        },
      }),
    ]);

    return {
      alunoId,
      materiaId,
      totalAulasFechadas,
      totalPresencas,
      frequencia:
        totalAulasFechadas === 0 ? 0 : totalPresencas / totalAulasFechadas,
    };
  }

  /** Faltas por matéria do aluno, com limite (tela de Faltas do app). */
  async calcularFaltasDoAluno(alunoId: string): Promise<FaltaResponseDTO[]> {
    const matriculas = await this.prismaService.matricula.findMany({
      where: { alunoId, active: true },
      select: {
        materiaId: true,
        materia: {
          select: { nome: true, codigo: true, faltaLimite: true },
        },
      },
      orderBy: { materia: { nome: 'asc' } },
    });

    return Promise.all(
      matriculas.map(async (m) => {
        const [totalAulasFechadas, totalPresencas] = await Promise.all([
          this.prismaService.aula.count({
            where: { materiaId: m.materiaId, status: 'FECHADA' },
          }),
          this.prismaService.presenca.count({
            where: {
              alunoId,
              aula: { materiaId: m.materiaId, status: 'FECHADA' },
            },
          }),
        ]);

        return {
          materiaId: m.materiaId,
          materiaNome: m.materia.nome,
          codigo: m.materia.codigo,
          faltas: totalAulasFechadas - totalPresencas,
          limite: m.materia.faltaLimite,
        };
      }),
    );
  }

  async listarPresencasPorAula(aulaId: string): Promise<PresencaModel[]> {
    const presencas = await this.prismaService.presenca.findMany({
      where: { aulaId },
      select: PRESENCA_SELECT,
      orderBy: { data: 'asc' },
    });

    return presencas.map((p) =>
      this.presencaMapper.toPresencaModelWithAluno(p),
    );
  }
}
