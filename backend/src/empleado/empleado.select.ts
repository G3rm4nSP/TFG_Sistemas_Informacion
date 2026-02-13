import { Prisma } from '@prisma/client';

export const empleadoSelect = {
  id: true,
  nombre: true,
  apellidos: true,
  correo: true,
  telefono: true,
  dni: true,
  direccion: true,
  activo: true,
  categoria: true,
  localId: true,
} satisfies Prisma.EmpleadoSelect;