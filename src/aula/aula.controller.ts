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
import { AulaService } from './aula.service';
import { CreateAulaDTO } from 'src/dto/aula/CreateAulaDTO';
import { AulaResponseDTO } from 'src/dto/aula/AulaResponseDTO';
import { AulaMapper } from 'src/mapper/aulamapper';

@Controller('aula')
export class AulaController {
  constructor(
    private aulaService: AulaService,
    private aulaMapper: AulaMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criarAula(@Body() dto: CreateAulaDTO): Promise<AulaResponseDTO> {
    const aulaModel = await this.aulaService.criarAula(dto);
    return this.aulaMapper.toResponse(aulaModel);
  }

  @Get('materia/:materiaId')
  async listarPorMateria(
    @Param('materiaId') materiaId: string,
  ): Promise<AulaResponseDTO[]> {
    const aulas = await this.aulaService.listarPorMateria(materiaId);
    return aulas.map((a) => this.aulaMapper.toResponse(a));
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string): Promise<AulaResponseDTO | null> {
    const aula = await this.aulaService.buscarPorId(id);
    if (!aula) {
      return null;
    }
    return this.aulaMapper.toResponse(aula);
  }

  @Patch(':id/fechar')
  async fecharAula(@Param('id') id: string): Promise<AulaResponseDTO> {
    const aulaModel = await this.aulaService.fecharAula(id);
    return this.aulaMapper.toResponse(aulaModel);
  }
}
