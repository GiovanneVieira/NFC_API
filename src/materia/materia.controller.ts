import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MateriaService } from './materia.service';
import { CreateMateriaDTO } from 'src/dto/materia/CreateMateriaDTO';
import { MateriaResponseDTO } from 'src/dto/materia/MateriaResponseDTO';
import { MateriaMapper } from 'src/mapper/materiamapper';

@Controller('materia')
export class MateriaController {
  constructor(
    private materiaService: MateriaService,
    private materiaMapper: MateriaMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criarMateria(
    @Body() dto: CreateMateriaDTO,
  ): Promise<MateriaResponseDTO> {
    const materiaModel = await this.materiaService.criarMateria(dto);
    return this.materiaMapper.toResponse(materiaModel);
  }

  @Get()
  async listarTodas(): Promise<MateriaResponseDTO[]> {
    const materias = await this.materiaService.listarTodas();
    return materias.map((m) => this.materiaMapper.toResponse(m));
  }

  @Get(':id')
  async buscarPorId(
    @Param('id') id: string,
  ): Promise<MateriaResponseDTO | null> {
    const materia = await this.materiaService.buscarPorId(id);
    if (!materia) {
      return null;
    }
    return this.materiaMapper.toResponse(materia);
  }
}
