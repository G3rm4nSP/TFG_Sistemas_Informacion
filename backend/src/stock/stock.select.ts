import { Prisma } from '@prisma/client';

export const stockSelect = {
    id: true,
    productoId: true,
    ubicacionId: true,
    cantidad: true,
    descuneto: true,
    updatedAt: true,
} as Prisma.StockSelect;