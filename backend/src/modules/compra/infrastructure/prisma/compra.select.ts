import { Prisma } from '@prisma/client';

export const compraSelect = {
    id: true,
    proveedorId: true,
    localId: true,
    fecha: true,
    total: true,
    detalles: {
        select: {
            productoId: true,
            cantidad: true,
            precioUnidad: true,
            producto: {
                select: {
                    nombre: true,
                    descripcion: true,
                }
            }
        }
    },
} satisfies Prisma.CompraSelect;