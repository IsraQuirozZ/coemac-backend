/*
  Warnings:

  - The `estado` column on the `Reunion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ReunionParticipante` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `invitadoId` to the `Reunion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoReunion" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'REALIZADA', 'CANCELADA');

-- DropForeignKey
ALTER TABLE "ReunionParticipante" DROP CONSTRAINT "ReunionParticipante_reunionId_fkey";

-- DropForeignKey
ALTER TABLE "ReunionParticipante" DROP CONSTRAINT "ReunionParticipante_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Reunion" ADD COLUMN     "invitadoId" TEXT NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoReunion" NOT NULL DEFAULT 'PENDIENTE';

-- DropTable
DROP TABLE "ReunionParticipante";

-- DropEnum
DROP TYPE "EstadoGlobalReunion";

-- DropEnum
DROP TYPE "EstadoParticipante";

-- CreateIndex
CREATE INDEX "Reunion_creadorId_idx" ON "Reunion"("creadorId");

-- CreateIndex
CREATE INDEX "Reunion_invitadoId_idx" ON "Reunion"("invitadoId");

-- AddForeignKey
ALTER TABLE "Reunion" ADD CONSTRAINT "Reunion_invitadoId_fkey" FOREIGN KEY ("invitadoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
