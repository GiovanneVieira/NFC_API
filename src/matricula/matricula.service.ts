import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma-modules/prisma/prisma';
import { MatriculaMapper } from 'src/mapper/matriculamapper';
import { MatriculaModel } from 'src/model/MatriculaModel';
import { CreateMatriculaDTO } from 'src/dto/matricula/CreateMatriculaDTO';

const USER_EXISTS_SELECT = { id: true, role: true } as const;
const MATERIA_EXISTS_SELECT = { id: true } as const;
const MATRICULA_EXISTS_SELECT = { id: true, active: true } as const;
const MATRICULA_DETAIL_SELECT = {
  id: true,
  alunoId: true,
  materiaId: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;
const MATRICULA_LIST_SELECT = {
  id: true,
  alunoId: true,
  materiaId: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  materia: {
    select: { id: true, codigo: true, nome: true },
  },
} as const;

@Injectable()
export class MatriculaService {
  constructor(
    private prismaService: PrismaService,
    private matriculaMapper: MatriculaMapper,
  ) {}

  async matricular(dto: CreateMatriculaDTO): Promise<MatriculaModel> {
    const aluno = await this.prismaService.user.findUnique({
      where: { id: dto.alunoId },
      select: USER_EXISTS_SELECT,
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    const materia = await this.prismaService.materia.findUnique({
      where: { id: dto.materiaId },
      select: MATERIA_EXISTS_SELECT,
    });

    if (!materia) {
      throw new NotFoundException('Matéria não encontrada');
    }

    const existente = await this.prismaService.matricula.findUnique({
      where: {
        alunoId_materiaId: {
          alunoId: dto.alunoId,
          materiaId: dto.materiaId,
        },
      },
      select: MATRICULA_EXISTS_SELECT,
    });

    if (existente) {
      if (existente.active) {
        throw new BadRequestException(
          'Aluno já está matriculado nesta matéria',
        );
      }

      const reativada = await this.prismaService.matricula.update({
        where: {
          id: existente.id,
        },
        data: { active: true },
        select: MATRICULA_DETAIL_SELECT,
      });

      return this.matriculaMapper.toMatriculaModel(reativada);
    }

    const prismaMatricula = await this.prismaService.matricula.create({
      data: {
        alunoId: dto.alunoId,
        materiaId: dto.materiaId,
      },
      select: MATRICULA_DETAIL_SELECT,
    });

    return this.matriculaMapper.toMatriculaModel(prismaMatricula);
  }

  async desmatricular(
    alunoId: string,
    materiaId: string,
  ): Promise<MatriculaModel> {
    const matricula = await this.prismaService.matricula.findUnique({
      where: {
        alunoId_materiaId: { alunoId, materiaId },
      },
      select: MATRICULA_EXISTS_SELECT,
    });

    if (!matricula) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    const desativada = await this.prismaService.matricula.update({
      where: { id: matricula.id },
      data: { active: false },
      select: MATRICULA_DETAIL_SELECT,
    });

    return this.matriculaMapper.toMatriculaModel(desativada);
  }

  async listarPorAluno(alunoId: string): Promise<MatriculaModel[]> {
    const matriculas = await this.prismaService.matricula.findMany({
      where: { alunoId, active: true },
      select: MATRICULA_LIST_SELECT,
    });

    return matriculas.map((m) =>
      this.matriculaMapper.toMatriculaModelWithMateria(m),
    );
  }
}
