/*
  Warnings:

  - The primary key for the `CompraDetalle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `VentaDetalle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `CompraDetalle` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `VentaDetalle` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `stockId` to the `VentaDetalle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompraDetalle" DROP CONSTRAINT "CompraDetalle_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "CompraDetalle_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "VentaDetalle" DROP CONSTRAINT "VentaDetalle_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "stockId" TEXT NOT NULL,
ADD CONSTRAINT "VentaDetalle_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "VentaDetalle" ADD CONSTRAINT "VentaDetalle_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
