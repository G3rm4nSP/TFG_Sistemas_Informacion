import { Prisma } from '@prisma/client';

export const stockSelect = {
    id: true,
    productoId: true,
    ubicacionId: true,
    cantidad: true,
    descuento: true,
    updatedAt: true,
} satisfies Prisma.StockSelect;