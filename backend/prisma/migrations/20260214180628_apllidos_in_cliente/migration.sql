/*
  Warnings:

  - Added the required column `apellidos` to the `Cliente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "apellidos" TEXT NOT NULL;
