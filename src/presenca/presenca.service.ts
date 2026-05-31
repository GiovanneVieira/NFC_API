import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma-modules/prisma/prisma';
import { PresencaMapper } from 'src/mapper/presencamapper';
import { PresencaModel } from 'src/model/PresencaModel';
import { CreatePresencaDTO } from 'src/dto/presenca/CreatePresencaDTO';
import { FrequenciaResponseDTO } from 'src/dto/presenca/FrequenciaResponseDTO';

const AULA_SELECT = {
  id: true,
  materiaId: true,
  dataHora: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

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

const MATRICULA_EXISTS_SELECT = {
  id: true,
  active: true,
} as const;

@Injectable()
export class PresencaService {
  private readonly logger = new Logger(PresencaService.name);

  constructor(
    private prismaService: PrismaService,
    private presencaMapper: PresencaMapper,
  ) {}

  async registrarPresenca(dto: CreatePresencaDTO): Promise<PresencaModel> {
    const aula = await this.prismaService.aula.findUnique({
      where: { id: dto.aulaId },
      select: AULA_SELECT,
    });

    if (!aula) {
      throw new BadRequestException('Aula não encontrada');
    }

    if ((aula.status as string) === 'FECHADA') {
      throw new ForbiddenException(
        'Não é possível registrar presença em uma aula fechada',
      );
    }

    const matricula = await this.prismaService.matricula.findUnique({
      where: {
        alunoId_materiaId: {
          alunoId: dto.alunoId,
          materiaId: aula.materiaId,
        },
      },
      select: MATRICULA_EXISTS_SELECT,
    });

    if (!matricula || !matricula.active) {
      throw new ForbiddenException('Aluno não está matriculado nesta matéria');
    }

    const prismaPresenca = await this.prismaService.presenca.upsert({
      where: {
        alunoId_aulaId: {
          alunoId: dto.alunoId,
          aulaId: dto.aulaId,
        },
      },
      create: {
        alunoId: dto.alunoId,
        aulaId: dto.aulaId,
        type: dto.type,
      },
      update: {},
    });

    this.logger.log(
      `Presença registrada: aluno=${dto.alunoId} aula=${dto.aulaId} tipo=${dto.type}`,
    );

    return this.presencaMapper.toPresencaModel(prismaPresenca);
  }

  async calcularFrequencia(
    alunoId: string,
    materiaId: string,
  ): Promise<FrequenciaResponseDTO> {
    const [totalAulasFechadas, totalPresencas] = await Promise.all([
      this.prismaService.aula.count({
        where: {
          materiaId,
          status: 'FECHADA' as const,
        },
      }),
      this.prismaService.presenca.count({
        where: {
          alunoId,
          aula: {
            materiaId,
            status: 'FECHADA' as const,
          },
        },
      }),
    ]);

    if (totalAulasFechadas === 0) {
      return {
        alunoId,
        materiaId,
        totalAulasFechadas: 0,
        totalPresencas: 0,
        frequencia: 0,
      };
    }

    return {
      alunoId,
      materiaId,
      totalAulasFechadas,
      totalPresencas,
      frequencia: totalPresencas / totalAulasFechadas,
    };
  }

  async listarPresencasPorAula(aulaId: string): Promise<PresencaModel[]> {
    const presencas = await this.prismaService.presenca.findMany({
      where: { aulaId },
      select: PRESENCA_SELECT,
    });

    return presencas.map((p) =>
      this.presencaMapper.toPresencaModelWithAluno(p),
    );
  }
}
