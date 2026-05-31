import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Session, Roles } from '@thallesp/nestjs-better-auth';
import { PresencaService } from './presenca.service';
import { CreatePresencaDTO } from 'src/dto/presenca/CreatePresencaDTO';
import { PresencaResponseDTO } from 'src/dto/presenca/PresencaResponseDTO';
import { FaltaResponseDTO } from 'src/dto/presenca/FaltaResponseDTO';
import { FrequenciaResponseDTO } from 'src/dto/presenca/FrequenciaResponseDTO';
import { PresencaMapper } from 'src/mapper/presencamapper';
import { Role } from 'src/model/UserModel';
import {
  isTeacher,
  assertSelfOrTeacher,
  type AppSession,
} from 'src/common/auth/access';

@Controller('presenca')
export class PresencaController {
  constructor(
    private presencaService: PresencaService,
    private presencaMapper: PresencaMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async registrarPresenca(
    @Body() dto: CreatePresencaDTO,
    @Session() session: AppSession,
  ): Promise<PresencaResponseDTO> {
    // Aluno só registra a própria presença; professor pode registrar por terceiros.
    let alunoId: string;
    if (isTeacher(session)) {
      if (!dto.alunoId) {
        throw new BadRequestException(
          'alunoId é obrigatório quando um professor registra a presença',
        );
      }
      alunoId = dto.alunoId;
    } else {
      alunoId = session.user.id;
    }

    const presencaModel = await this.presencaService.registrarPresenca(
      alunoId,
      dto.aulaId,
      dto.type,
    );
    return this.presencaMapper.toResponse(presencaModel);
  }

  @Get('aula/:aulaId')
  @Roles([Role.TEACHER])
  async listarPorAula(
    @Param('aulaId') aulaId: string,
  ): Promise<PresencaResponseDTO[]> {
    const presencas = await this.presencaService.listarPresencasPorAula(aulaId);
    return presencas.map((p) => this.presencaMapper.toResponse(p));
  }

  /** Faltas por matéria do aluno autenticado (tela de Faltas do app). */
  @Get('faltas/me')
  async minhasFaltas(
    @Session() session: AppSession,
  ): Promise<FaltaResponseDTO[]> {
    return this.presencaService.calcularFaltasDoAluno(session.user.id);
  }

  @Get('frequencia/:alunoId/:materiaId')
  async calcularFrequencia(
    @Param('alunoId') alunoId: string,
    @Param('materiaId') materiaId: string,
    @Session() session: AppSession,
  ): Promise<FrequenciaResponseDTO> {
    assertSelfOrTeacher(session, alunoId);
    return this.presencaService.calcularFrequencia(alunoId, materiaId);
  }
}
