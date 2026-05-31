import { Injectable } from '@nestjs/common';
import { MatriculaModel } from 'src/model/MatriculaModel';
import { MatriculaResponseDTO } from 'src/dto/matricula/MatriculaResponseDTO';

type MatriculaRow = {
  id: string;
  alunoId: string;
  materiaId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type MatriculaWithMateria = {
  id: string;
  alunoId: string;
  materiaId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  materia: { id: string; codigo: string; nome: string };
};

@Injectable()
export class MatriculaMapper {
  toMatriculaModel(row: MatriculaRow): MatriculaModel {
    return new MatriculaModel(
      row.id,
      row.alunoId,
      row.materiaId,
      row.active,
      row.createdAt,
      row.updatedAt,
    );
  }

  toMatriculaModelWithMateria(row: MatriculaWithMateria): MatriculaModel {
    return new MatriculaModel(
      row.id,
      row.alunoId,
      row.materiaId,
      row.active,
      row.createdAt,
      row.updatedAt,
      row.materia.codigo,
      row.materia.nome,
    );
  }

  toResponse(matriculaModel: MatriculaModel): MatriculaResponseDTO {
    const dto: MatriculaResponseDTO = {
      id: matriculaModel.id,
      alunoId: matriculaModel.alunoId,
      materiaId: matriculaModel.materiaId,
      active: matriculaModel.active,
      createdAt: matriculaModel.createdAt.toISOString(),
    };

    if (matriculaModel.materiaCodigo !== undefined) {
      dto.materiaCodigo = matriculaModel.materiaCodigo;
    }

    if (matriculaModel.materiaNome !== undefined) {
      dto.materiaNome = matriculaModel.materiaNome;
    }

    return dto;
  }
}
