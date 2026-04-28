/*
  Warnings:

  - You are about to drop the column `fechaHora` on the `Reunion` table. All the data in the column will be lost.
  - Added the required column `fecha` to the `Reunion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reunion" DROP COLUMN "fechaHora",
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL;
