/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Aula` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Jwks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Materia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Matricula` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Nota` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Presenca` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Aula" DROP CONSTRAINT "Aula_materiaId_fkey";

-- DropForeignKey
ALTER TABLE "Materia" DROP CONSTRAINT "Materia_professorId_fkey";

-- DropForeignKey
ALTER TABLE "Matricula" DROP CONSTRAINT "Matricula_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "Matricula" DROP CONSTRAINT "Matricula_materiaId_fkey";

-- DropForeignKey
ALTER TABLE "Nota" DROP CONSTRAINT "Nota_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "Nota" DROP CONSTRAINT "Nota_materiaId_fkey";

-- DropForeignKey
ALTER TABLE "Presenca" DROP CONSTRAINT "Presenca_alunoId_fkey";

-- DropForeignKey
ALTER TABLE "Presenca" DROP CONSTRAINT "Presenca_aulaId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Aula";

-- DropTable
DROP TABLE "Jwks";

-- DropTable
DROP TABLE "Materia";

-- DropTable
DROP TABLE "Matricula";

-- DropTable
DROP TABLE "Nota";

-- DropTable
DROP TABLE "Presenca";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Verification";

-- CreateTable
CREATE TABLE "user_table" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "RA" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "course" TEXT,
    "cpf" TEXT,
    "cardValidity" TIMESTAMP(3),

    CONSTRAINT "user_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_table" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_table" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_table" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jwks_table" (
    "id" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "jwks_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materia_table" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "professorId" TEXT,
    "faltaLimite" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materia_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aula_table" (
    "id" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "sala" TEXT,
    "status" "AulaStatus" NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aula_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presenca_table" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "PresencaType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presenca_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matricula_table" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matricula_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nota_table" (
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

    CONSTRAINT "nota_table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_table_email_key" ON "user_table"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_table_RA_key" ON "user_table"("RA");

-- CreateIndex
CREATE UNIQUE INDEX "user_table_cpf_key" ON "user_table"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "session_table_token_key" ON "session_table"("token");

-- CreateIndex
CREATE INDEX "session_table_userId_idx" ON "session_table"("userId");

-- CreateIndex
CREATE INDEX "account_table_userId_idx" ON "account_table"("userId");

-- CreateIndex
CREATE INDEX "verification_table_identifier_idx" ON "verification_table"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "materia_table_codigo_key" ON "materia_table"("codigo");

-- CreateIndex
CREATE INDEX "materia_table_professorId_idx" ON "materia_table"("professorId");

-- CreateIndex
CREATE INDEX "aula_table_materiaId_idx" ON "aula_table"("materiaId");

-- CreateIndex
CREATE INDEX "presenca_table_alunoId_idx" ON "presenca_table"("alunoId");

-- CreateIndex
CREATE INDEX "presenca_table_aulaId_idx" ON "presenca_table"("aulaId");

-- CreateIndex
CREATE UNIQUE INDEX "presenca_table_alunoId_aulaId_key" ON "presenca_table"("alunoId", "aulaId");

-- CreateIndex
CREATE INDEX "matricula_table_alunoId_idx" ON "matricula_table"("alunoId");

-- CreateIndex
CREATE INDEX "matricula_table_materiaId_idx" ON "matricula_table"("materiaId");

-- CreateIndex
CREATE UNIQUE INDEX "matricula_table_alunoId_materiaId_key" ON "matricula_table"("alunoId", "materiaId");

-- CreateIndex
CREATE INDEX "nota_table_alunoId_idx" ON "nota_table"("alunoId");

-- CreateIndex
CREATE INDEX "nota_table_materiaId_idx" ON "nota_table"("materiaId");

-- CreateIndex
CREATE UNIQUE INDEX "nota_table_alunoId_materiaId_term_key" ON "nota_table"("alunoId", "materiaId", "term");

-- AddForeignKey
ALTER TABLE "session_table" ADD CONSTRAINT "session_table_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_table" ADD CONSTRAINT "account_table_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materia_table" ADD CONSTRAINT "materia_table_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "user_table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aula_table" ADD CONSTRAINT "aula_table_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materia_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presenca_table" ADD CONSTRAINT "presenca_table_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "user_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presenca_table" ADD CONSTRAINT "presenca_table_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "aula_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matricula_table" ADD CONSTRAINT "matricula_table_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "user_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matricula_table" ADD CONSTRAINT "matricula_table_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materia_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nota_table" ADD CONSTRAINT "nota_table_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "user_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nota_table" ADD CONSTRAINT "nota_table_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "materia_table"("id") ON DELETE CASCADE ON UPDATE CASCADE;
