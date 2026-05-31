import { Injectable } from '@nestjs/common';
import { AulaModel, AulaStatus } from 'src/model/AulaModel';
import { AulaResponseDTO } from 'src/dto/aula/AulaResponseDTO';

type AulaRow = {
  id: string;
  materiaId: string;
  dataHora: Date;
  sala: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  materia?: { nome: string; professor?: { name: string } | null } | null;
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
      row.sala ?? null,
      row.materia?.nome,
      row.materia?.professor?.name ?? undefined,
    );
  }

  toResponse(aulaModel: AulaModel): AulaResponseDTO {
    const dto: AulaResponseDTO = {
      id: aulaModel.id,
      materiaId: aulaModel.materiaId,
      dataHora: aulaModel.dataHora.toISOString(),
      sala: aulaModel.sala,
      status: aulaModel.status,
      createdAt: aulaModel.createdAt.toISOString(),
    };

    if (aulaModel.materiaNome !== undefined) {
      dto.materiaNome = aulaModel.materiaNome;
    }
    if (aulaModel.professorNome !== undefined) {
      dto.professorNome = aulaModel.professorNome;
    }

    return dto;
  }
}
