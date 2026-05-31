import { PrismaService } from 'src/prisma-modules/prisma/prisma';

/** Cria um mock do PrismaService com todos os métodos como jest.fn(). */
export function createPrismaMock() {
  const model = () => ({
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  });

  return {
    user: model(),
    materia: model(),
    aula: model(),
    presenca: model(),
    matricula: model(),
    nota: model(),
    $queryRaw: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
}

export type PrismaMock = ReturnType<typeof createPrismaMock>;

/** Helper para registrar o mock como PrismaService em um TestingModule. */
export function prismaMockProvider(mock: PrismaMock) {
  return { provide: PrismaService, useValue: mock as unknown as PrismaService };
}
