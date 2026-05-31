import { Injectable } from '@nestjs/common';
import { PresencaModel, PresencaType } from 'src/model/PresencaModel';
import { PresencaResponseDTO } from 'src/dto/presenca/PresencaResponseDTO';

type PresencaRow = {
  id: string;
  alunoId: string;
  aulaId: string;
  data: Date;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

type PresencaWithAluno = {
  id: string;
  alunoId: string;
  aulaId: string;
  data: Date;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  aluno: { id: string; name: string; RA: string };
};

@Injectable()
export class PresencaMapper {
  toPresencaModel(row: PresencaRow): PresencaModel {
    return new PresencaModel(
      row.id,
      row.alunoId,
      row.aulaId,
      row.data,
      row.type as PresencaType,
      row.createdAt,
      row.updatedAt,
    );
  }

  toPresencaModelWithAluno(row: PresencaWithAluno): PresencaModel {
    return new PresencaModel(
      row.id,
      row.alunoId,
      row.aulaId,
      row.data,
      row.type as PresencaType,
      row.createdAt,
      row.updatedAt,
      row.aluno.name,
      row.aluno.RA,
    );
  }

  toResponse(presencaModel: PresencaModel): PresencaResponseDTO {
    const dto: PresencaResponseDTO = {
      id: presencaModel.id,
      alunoId: presencaModel.alunoId,
      aulaId: presencaModel.aulaId,
      data: presencaModel.data.toISOString(),
      type: presencaModel.type,
      createdAt: presencaModel.createdAt.toISOString(),
    };

    if (presencaModel.alunoName !== undefined) {
      dto.alunoName = presencaModel.alunoName;
    }

    if (presencaModel.alunoRA !== undefined) {
      dto.alunoRA = presencaModel.alunoRA;
    }

    return dto;
  }
}
