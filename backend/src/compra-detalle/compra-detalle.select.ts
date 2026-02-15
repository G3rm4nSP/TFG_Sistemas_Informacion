import { Prisma } from '@prisma/client';

export const compraDetalleSelect = {
    compraId: true,
    productoId: true,
    cantidad: true,
    precioLote: true,
} satisfies Prisma.CompraDetalleSelect;