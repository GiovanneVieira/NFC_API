import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Session, Roles } from '@thallesp/nestjs-better-auth';
import { NotaService } from './nota.service';
import { CreateNotaDTO } from 'src/dto/nota/CreateNotaDTO';
import { NotaResponseDTO } from 'src/dto/nota/NotaResponseDTO';
import { NotaMapper } from 'src/mapper/notamapper';
import { Role } from 'src/model/UserModel';
import { assertSelfOrTeacher, type AppSession } from 'src/common/auth/access';

@Controller('nota')
export class NotaController {
  constructor(
    private notaService: NotaService,
    private notaMapper: NotaMapper,
  ) {}

  @Post()
  @Roles([Role.TEACHER])
  @HttpCode(HttpStatus.CREATED)
  async lancarNota(@Body() dto: CreateNotaDTO): Promise<NotaResponseDTO> {
    const nota = await this.notaService.upsertNota(dto);
    return this.notaMapper.toResponse(nota);
  }

  /** Notas do aluno autenticado (tela de Notas do app). */
  @Get('me')
  async minhasNotas(
    @Session() session: AppSession,
    @Query('term') term?: string,
  ): Promise<NotaResponseDTO[]> {
    const notas = await this.notaService.listarPorAluno(session.user.id, term);
    return notas.map((n) => this.notaMapper.toResponse(n));
  }

  @Get('aluno/:alunoId')
  async listarPorAluno(
    @Param('alunoId') alunoId: string,
    @Session() session: AppSession,
    @Query('term') term?: string,
  ): Promise<NotaResponseDTO[]> {
    assertSelfOrTeacher(session, alunoId);
    const notas = await this.notaService.listarPorAluno(alunoId, term);
    return notas.map((n) => this.notaMapper.toResponse(n));
  }
}
