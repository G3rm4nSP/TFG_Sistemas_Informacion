/*
  Warnings:

  - Added the required column `descuento` to the `VentaDetalle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VentaDetalle" ADD COLUMN     "descuento" DOUBLE PRECISION NOT NULL;
