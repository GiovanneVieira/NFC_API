import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PresencaService } from './presenca.service';
import { CreatePresencaDTO } from 'src/dto/presenca/CreatePresencaDTO';
import { PresencaResponseDTO } from 'src/dto/presenca/PresencaResponseDTO';
import { PresencaMapper } from 'src/mapper/presencamapper';

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
  ): Promise<PresencaResponseDTO> {
    const presencaModel = await this.presencaService.registrarPresenca(dto);
    return this.presencaMapper.toResponse(presencaModel);
  }

  @Get('aula/:aulaId')
  async listarPorAula(
    @Param('aulaId') aulaId: string,
  ): Promise<PresencaResponseDTO[]> {
    const presencas = await this.presencaService.listarPresencasPorAula(aulaId);
    return presencas.map((p) => this.presencaMapper.toResponse(p));
  }

  @Get('frequencia/:alunoId/:materiaId')
  async calcularFrequencia(
    @Param('alunoId') alunoId: string,
    @Param('materiaId') materiaId: string,
  ) {
    return this.presencaService.calcularFrequencia(alunoId, materiaId);
  }
}
