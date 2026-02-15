import { Prisma } from '@prisma/client';

export const compraSelect = {
    id: true,
    proveedorId: true,
    localId: true,
    fecha: true,
    total: true,
} as Prisma.CompraSelect;