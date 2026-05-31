import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { Session, Roles } from '@thallesp/nestjs-better-auth';
import { MatriculaService } from './matricula.service';
import { CreateMatriculaDTO } from 'src/dto/matricula/CreateMatriculaDTO';
import { MatriculaResponseDTO } from 'src/dto/matricula/MatriculaResponseDTO';
import { MatriculaMapper } from 'src/mapper/matriculamapper';
import { Role } from 'src/model/UserModel';
import { assertSelfOrTeacher, type AppSession } from 'src/common/auth/access';

@Controller('matricula')
export class MatriculaController {
  constructor(
    private matriculaService: MatriculaService,
    private matriculaMapper: MatriculaMapper,
  ) {}

  @Post()
  @Roles([Role.TEACHER])
  @HttpCode(HttpStatus.CREATED)
  async matricular(
    @Body() dto: CreateMatriculaDTO,
  ): Promise<MatriculaResponseDTO> {
    const matriculaModel = await this.matriculaService.matricular(dto);
    return this.matriculaMapper.toResponse(matriculaModel);
  }

  @Delete(':alunoId/:materiaId')
  @Roles([Role.TEACHER])
  async desmatricular(
    @Param('alunoId') alunoId: string,
    @Param('materiaId') materiaId: string,
  ): Promise<MatriculaResponseDTO> {
    const matriculaModel = await this.matriculaService.desmatricular(
      alunoId,
      materiaId,
    );
    return this.matriculaMapper.toResponse(matriculaModel);
  }

  @Get('aluno/:alunoId')
  async listarPorAluno(
    @Param('alunoId') alunoId: string,
    @Session() session: AppSession,
  ): Promise<MatriculaResponseDTO[]> {
    assertSelfOrTeacher(session, alunoId);
    const matriculas = await this.matriculaService.listarPorAluno(alunoId);
    return matriculas.map((m) => this.matriculaMapper.toResponse(m));
  }
}
