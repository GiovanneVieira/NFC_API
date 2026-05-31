import { Injectable } from '@nestjs/common';
import { MateriaModel } from 'src/model/MateriaModel';
import { MateriaResponseDTO } from 'src/dto/materia/MateriaResponseDTO';

type MateriaRow = {
  id: string;
  codigo: string;
  nome: string;
  createdAt: Date;
  updatedAt: Date;
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
    );
  }

  toResponse(materiaModel: MateriaModel): MateriaResponseDTO {
    return {
      id: materiaModel.id,
      codigo: materiaModel.codigo,
      nome: materiaModel.nome,
      createdAt: materiaModel.createdAt.toISOString(),
    };
  }
}
