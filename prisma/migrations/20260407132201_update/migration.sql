/*
  Warnings:

  - You are about to drop the column `fecha` on the `Reunion` table. All the data in the column will be lost.
  - You are about to drop the column `invitadoId` on the `Reunion` table. All the data in the column will be lost.
  - You are about to drop the column `solicitanteId` on the `Reunion` table. All the data in the column will be lost.
  - The `estado` column on the `Reunion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `nombreContacto` to the `Agradecimiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creadorId` to the `Reunion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaHora` to the `Reunion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoGlobalReunion" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'REALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoParticipante" AS ENUM ('PENDIENTE', 'RECHAZADA', 'ACEPTADA');

-- DropForeignKey
ALTER TABLE "Reunion" DROP CONSTRAINT "Reunion_invitadoId_fkey";

-- DropForeignKey
ALTER TABLE "Reunion" DROP CONSTRAINT "Reunion_solicitanteId_fkey";

-- DropIndex
DROP INDEX "Reunion_invitadoId_idx";

-- DropIndex
DROP INDEX "Reunion_solicitanteId_idx";

-- AlterTable
ALTER TABLE "Agradecimiento" ADD COLUMN     "nombreContacto" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reunion" DROP COLUMN "fecha",
DROP COLUMN "invitadoId",
DROP COLUMN "solicitanteId",
ADD COLUMN     "creadorId" TEXT NOT NULL,
ADD COLUMN     "fechaHora" TIMESTAMP(3) NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoGlobalReunion" NOT NULL DEFAULT 'PENDIENTE';

-- DropEnum
DROP TYPE "EstadoReunion";

-- CreateTable
CREATE TABLE "ReunionParticipante" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "reunionId" TEXT NOT NULL,
    "estado" "EstadoParticipante" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "ReunionParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReunionParticipante_usuarioId_reunionId_key" ON "ReunionParticipante"("usuarioId", "reunionId");

-- AddForeignKey
ALTER TABLE "Reunion" ADD CONSTRAINT "Reunion_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReunionParticipante" ADD CONSTRAINT "ReunionParticipante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReunionParticipante" ADD CONSTRAINT "ReunionParticipante_reunionId_fkey" FOREIGN KEY ("reunionId") REFERENCES "Reunion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
