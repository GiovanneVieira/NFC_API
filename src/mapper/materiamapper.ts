import { Injectable } from '@nestjs/common';
import { MateriaModel } from 'src/model/MateriaModel';
import { MateriaResponseDTO } from 'src/dto/materia/MateriaResponseDTO';

type MateriaRow = {
  id: string;
  codigo: string;
  nome: string;
  faltaLimite: number | null;
  professorId: string | null;
  createdAt: Date;
  updatedAt: Date;
  professor?: { name: string } | null;
};

@Injectable()
export class MateriaMapper {
  toMateriaModel(row: MateriaRow): MateriaModel {
    return new MateriaModel(
      row.id,
      row.codigo,
      row.nome,
      row.createdAt,
      row.updatedAt,
      row.faltaLimite ?? null,
      row.professorId ?? null,
      row.professor?.name,
    );
  }

  toResponse(materiaModel: MateriaModel): MateriaResponseDTO {
    const dto: MateriaResponseDTO = {
      id: materiaModel.id,
      codigo: materiaModel.codigo,
      nome: materiaModel.nome,
      faltaLimite: materiaModel.faltaLimite,
      professorId: materiaModel.professorId,
      createdAt: materiaModel.createdAt.toISOString(),
    };

    if (materiaModel.professorNome !== undefined) {
      dto.professorNome = materiaModel.professorNome;
    }

    return dto;
  }
}
