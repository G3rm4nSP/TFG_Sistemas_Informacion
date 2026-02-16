/*
  Warnings:

  - You are about to drop the `EmpleadoAusencias` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmpleadoAusencias" DROP CONSTRAINT "EmpleadoAusencias_empleadoId_fkey";

-- DropTable
DROP TABLE "EmpleadoAusencias";

-- CreateTable
CREATE TABLE "EmpleadoAusencia" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "EmpleadoAusencia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmpleadoAusencia" ADD CONSTRAINT "EmpleadoAusencia_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
