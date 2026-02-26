import { Prisma } from '@prisma/client';

export const ventaSelect = {
    id: true,
    empleadoId: true,
    clienteId: true,
    fecha: true,
    total: true,
} satisfies Prisma.VentaSelect;