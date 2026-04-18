/*
  Warnings:

  - You are about to drop the column `precioLote` on the `CompraDetalle` table. All the data in the column will be lost.
  - Added the required column `precioUnidad` to the `CompraDetalle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompraDetalle" DROP COLUMN "precioLote",
ADD COLUMN     "precioUnidad" DOUBLE PRECISION NOT NULL;
