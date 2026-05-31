import { Injectable } from '@nestjs/common';
import { NotaModel } from 'src/model/NotaModel';
import { NotaResponseDTO } from 'src/dto/nota/NotaResponseDTO';

type NotaRow = {
  id: string;
  alunoId: string;
  materiaId: string;
  term: string;
  ac1: number | null;
  ac2: number | null;
  af: number | null;
  sub: number | null;
  ag: number | null;
  media: number | null;
  createdAt: Date;
  updatedAt: Date;
  materia?: { nome: string; codigo: string } | null;
};

@Injectable()
export class NotaMapper {
  toNotaModel(row: NotaRow): NotaModel {
    return new NotaModel(
      row.id,
      row.alunoId,
      row.materiaId,
      row.term,
      row.ac1,
      row.ac2,
      row.af,
      row.sub,
      row.ag,
      row.media,
      row.createdAt,
      row.updatedAt,
      row.materia?.nome,
      row.materia?.codigo,
    );
  }

  toResponse(model: NotaModel): NotaResponseDTO {
    const dto: NotaResponseDTO = {
      id: model.id,
      alunoId: model.alunoId,
      materiaId: model.materiaId,
      term: model.term,
      ac1: model.ac1,
      ac2: model.ac2,
      af: model.af,
      sub: model.sub,
      ag: model.ag,
      media: model.media,
      createdAt: model.createdAt.toISOString(),
    };

    if (model.materiaNome !== undefined) {
      dto.materiaNome = model.materiaNome;
    }
    if (model.codigo !== undefined) {
      dto.codigo = model.codigo;
    }

    return dto;
  }
}
