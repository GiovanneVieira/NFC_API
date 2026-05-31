import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma-modules/prisma/prisma';
import { NotaMapper } from 'src/mapper/notamapper';
import { NotaModel } from 'src/model/NotaModel';
import { CreateNotaDTO } from 'src/dto/nota/CreateNotaDTO';

const NOTA_SELECT = {
  id: true,
  alunoId: true,
  materiaId: true,
  term: true,
  ac1: true,
  ac2: true,
  af: true,
  sub: true,
  ag: true,
  media: true,
  createdAt: true,
  updatedAt: true,
  materia: { select: { nome: true, codigo: true } },
} as const;

@Injectable()
export class NotaService {
  constructor(
    private prismaService: PrismaService,
    private notaMapper: NotaMapper,
  ) {}

  /** Cria ou atualiza as notas de um aluno em uma matéria, em um período. */
  async upsertNota(dto: CreateNotaDTO): Promise<NotaModel> {
    const [aluno, materia] = await Promise.all([
      this.prismaService.user.findUnique({
        where: { id: dto.alunoId },
        select: { id: true },
      }),
      this.prismaService.materia.findUnique({
        where: { id: dto.materiaId },
        select: { id: true },
      }),
    ]);

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }
    if (!materia) {
      throw new NotFoundException('Matéria não encontrada');
    }

    const data = {
      ac1: dto.ac1,
      ac2: dto.ac2,
      af: dto.af,
      sub: dto.sub,
      ag: dto.ag,
      media: dto.media,
    };

    const nota = await this.prismaService.nota.upsert({
      where: {
        alunoId_materiaId_term: {
          alunoId: dto.alunoId,
          materiaId: dto.materiaId,
          term: dto.term,
        },
      },
      create: {
        alunoId: dto.alunoId,
        materiaId: dto.materiaId,
        term: dto.term,
        ...data,
      },
      update: data,
      select: NOTA_SELECT,
    });

    return this.notaMapper.toNotaModel(nota);
  }

  async listarPorAluno(alunoId: string, term?: string): Promise<NotaModel[]> {
    const notas = await this.prismaService.nota.findMany({
      where: { alunoId, ...(term ? { term } : {}) },
      select: NOTA_SELECT,
      orderBy: { materia: { nome: 'asc' } },
    });

    return notas.map((n) => this.notaMapper.toNotaModel(n));
  }
}
