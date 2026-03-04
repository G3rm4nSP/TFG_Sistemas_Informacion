/*
  Warnings:

  - The `tipo` column on the `Ubicacion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[productoId,ubicacionId]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Ubi" AS ENUM ('ALMACEN', 'TIENDA');

-- AlterTable
ALTER TABLE "Ubicacion" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "Ubi" NOT NULL DEFAULT 'ALMACEN';

-- CreateIndex
CREATE UNIQUE INDEX "Stock_productoId_ubicacionId_key" ON "Stock"("productoId", "ubicacionId");
