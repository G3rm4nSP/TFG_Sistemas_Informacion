import { Prisma } from '@prisma/client';

export const compraDetalleSelect = {
    compraId: true,
    productoId: true,
    cantidad: true,
    precioUnidad: true,
} satisfies Prisma.CompraDetalleSelect;