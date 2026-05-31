import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Session, Roles } from '@thallesp/nestjs-better-auth';
import { AulaService } from './aula.service';
import { CreateAulaDTO } from 'src/dto/aula/CreateAulaDTO';
import { AulaResponseDTO } from 'src/dto/aula/AulaResponseDTO';
import { AulaMapper } from 'src/mapper/aulamapper';
import { Role } from 'src/model/UserModel';
import type { AppSession } from 'src/common/auth/access';

@Controller('aula')
export class AulaController {
  constructor(
    private aulaService: AulaService,
    private aulaMapper: AulaMapper,
  ) {}

  @Post()
  @Roles([Role.TEACHER])
  @HttpCode(HttpStatus.CREATED)
  async criarAula(@Body() dto: CreateAulaDTO): Promise<AulaResponseDTO> {
    const aulaModel = await this.aulaService.criarAula(dto);
    return this.aulaMapper.toResponse(aulaModel);
  }

  /** Aulas das matérias em que o aluno autenticado está matriculado. */
  @Get('me')
  async minhasAulas(
    @Session() session: AppSession,
  ): Promise<AulaResponseDTO[]> {
    const aulas = await this.aulaService.listarParaAluno(session.user.id);
    return aulas.map((a) => this.aulaMapper.toResponse(a));
  }

  @Get('materia/:materiaId')
  async listarPorMateria(
    @Param('materiaId') materiaId: string,
  ): Promise<AulaResponseDTO[]> {
    const aulas = await this.aulaService.listarPorMateria(materiaId);
    return aulas.map((a) => this.aulaMapper.toResponse(a));
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string): Promise<AulaResponseDTO> {
    const aula = await this.aulaService.buscarPorIdOuFalha(id);
    return this.aulaMapper.toResponse(aula);
  }

  @Patch(':id/fechar')
  @Roles([Role.TEACHER])
  async fecharAula(@Param('id') id: string): Promise<AulaResponseDTO> {
    const aulaModel = await this.aulaService.fecharAula(id);
    return this.aulaMapper.toResponse(aulaModel);
  }
}
