import { Prisma } from '@prisma/client';

export const clienteSelect = {
  id: true,
  nombre: true, 
  apellidos: true,
  correo: true,
  telefono: true,
} satisfies Prisma.ClienteSelect;