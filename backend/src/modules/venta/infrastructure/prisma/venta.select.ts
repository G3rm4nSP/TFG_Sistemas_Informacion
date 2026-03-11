import { Prisma } from '@prisma/client';

export const ventaSelect = {
    id: true,
    empleadoId: true,
    clienteId: true,
    localId: true,
    fecha: true,
    total: true,

    detalles: true,
} satisfies Prisma.VentaSelect;