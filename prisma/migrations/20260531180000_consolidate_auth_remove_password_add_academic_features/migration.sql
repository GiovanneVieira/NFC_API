-- AlterTable
ALTER TABLE "Aula" ADD COLUMN     "sala" TEXT;

-- AlterTable
ALTER TABLE "Materia" ADD COLUMN     "faltaLimite" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "cardValidity" TIMESTAMP(3),
ADD COLUMN     "course" TEXT,
ADD COLUMN     "cpf" TEXT;

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "ac1" DOUBLE PRECISION,
    "ac2" DOUBLE PRECISION,
    "af" DOUBLE PRECISION,
    "sub" DOUBLE PRECISION,
    "ag" DOUBLE PRECISION,
    "media" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Nota_alunoId_idx" ON "Nota"("alunoId");

-- CreateIndex
CREATE INDEX "Nota_materiaId_idx" ON "Nota"("materiaId");

-- CreateIndex
CREATE UNIQUE INDEX "Nota_alunoId_materiaId_term_key" ON "Nota"("alunoId", "materiaId", "term");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
