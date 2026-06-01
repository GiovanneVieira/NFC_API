/*
  Warnings:

  - A unique constraint covering the columns `[nfcUid]` on the table `user_table` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user_table" ADD COLUMN     "nfcUid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_table_nfcUid_key" ON "user_table"("nfcUid");
