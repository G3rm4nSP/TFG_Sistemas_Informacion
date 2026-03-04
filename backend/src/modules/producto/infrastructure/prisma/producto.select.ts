import { Prisma } from '@prisma/client';

export const productoSelect = {
    id: true,
    nombre: true,
    descripcion: true,
    tipo: true,
    porcentajeIVA: true,
    precioBase: true,
    expiracion: true,

    stocks: {
        select: {
            cantidad: true,
        }
    },
} satisfies Prisma.ProductoSelect;