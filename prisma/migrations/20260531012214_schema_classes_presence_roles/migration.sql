-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "AulaStatus" AS ENUM ('ABERTA', 'FECHADA');

-- CreateEnum
CREATE TYPE "PresencaType" AS ENUM ('NFC', 'QR_CODE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE "Materia" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "professorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aula" (
    "id" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "status" "AulaStatus" NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presenca" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "PresencaType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matricula" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matricula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Materia_codigo_key" ON "Materia"("codigo");

-- CreateIndex
CREATE INDEX "Materia_professorId_idx" ON "Materia"("professorId");

-- CreateIndex
CREATE INDEX "Aula_materiaId_idx" ON "Aula"("materiaId");

-- CreateIndex
CREATE INDEX "Presenca_alunoId_idx" ON "Presenca"("alunoId");

-- CreateIndex
CREATE INDEX "Presenca_aulaId_idx" ON "Presenca"("aulaId");

-- CreateIndex
CREATE UNIQUE INDEX "Presenca_alunoId_aulaId_key" ON "Presenca"("alunoId", "aulaId");

-- CreateIndex
CREATE INDEX "Matricula_alunoId_idx" ON "Matricula"("alunoId");

-- CreateIndex
CREATE INDEX "Matricula_materiaId_idx" ON "Matricula"("materiaId");

-- CreateIndex
CREATE UNIQUE INDEX "Matricula_alunoId_materiaId_key" ON "Matricula"("alunoId", "materiaId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
