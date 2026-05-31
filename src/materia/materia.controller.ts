import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Session, Roles } from '@thallesp/nestjs-better-auth';
import { MateriaService } from './materia.service';
import { CreateMateriaDTO } from 'src/dto/materia/CreateMateriaDTO';
import { MateriaResponseDTO } from 'src/dto/materia/MateriaResponseDTO';
import { MateriaMapper } from 'src/mapper/materiamapper';
import { Role } from 'src/model/UserModel';
import type { AppSession } from 'src/common/auth/access';

@Controller('materia')
export class MateriaController {
  constructor(
    private materiaService: MateriaService,
    private materiaMapper: MateriaMapper,
  ) {}

  @Post()
  @Roles([Role.TEACHER])
  @HttpCode(HttpStatus.CREATED)
  async criarMateria(
    @Body() dto: CreateMateriaDTO,
    @Session() session: AppSession,
  ): Promise<MateriaResponseDTO> {
    const materiaModel = await this.materiaService.criarMateria(
      dto,
      session.user.id,
    );
    return this.materiaMapper.toResponse(materiaModel);
  }

  @Get()
  async listarTodas(): Promise<MateriaResponseDTO[]> {
    const materias = await this.materiaService.listarTodas();
    return materias.map((m) => this.materiaMapper.toResponse(m));
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string): Promise<MateriaResponseDTO> {
    const materia = await this.materiaService.buscarPorIdOuFalha(id);
    return this.materiaMapper.toResponse(materia);
  }
}
