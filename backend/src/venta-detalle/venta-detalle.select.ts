import { Prisma } from "@prisma/client";

export const ventaDetalleSelect = {
    ventaId : true,
    productoId : true,
    cantidad : true,
    precioSinIVA: true,
    precioFinal: true,
} satisfies Prisma.VentaDetalleSelect;