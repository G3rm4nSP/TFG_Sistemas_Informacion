import { Prisma } from '@prisma/client';

export const compraSelect = {
    id: true,
    proveedorId: true,
    empleadoId: true,
    localId: true,
    fecha: true,
    total: true,
    detalles: {
        select: {
            id: true,
            productoId: true,
            cantidad: true,
            precioUnidad: true,
            producto: {
                select: {
                    nombre: true,
                    descripcion: true,
                    expiracion: true,
                }
            }
        }
    },
    empleado: true,
    proveedor: true,
    local: true,
} satisfies Prisma.CompraSelect;