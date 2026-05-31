import { Injectable } from '@nestjs/common';
import { AulaModel, AulaStatus } from 'src/model/AulaModel';
import { AulaResponseDTO } from 'src/dto/aula/AulaResponseDTO';

type AulaRow = {
  id: string;
  materiaId: string;
  dataHora: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AulaMapper {
  toAulaModel(row: AulaRow): AulaModel {
    return new AulaModel(
      row.id,
      row.materiaId,
      row.dataHora,
      row.status as AulaStatus,
      row.createdAt,
      row.updatedAt,
    );
  }

  toResponse(aulaModel: AulaModel): AulaResponseDTO {
    return {
      id: aulaModel.id,
      materiaId: aulaModel.materiaId,
      dataHora: aulaModel.dataHora.toISOString(),
      status: aulaModel.status,
      createdAt: aulaModel.createdAt.toISOString(),
    };
  }
}
