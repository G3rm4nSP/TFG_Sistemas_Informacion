import { Prisma } from '@prisma/client';

export const ventaSelect = {
    id: true,
    empleadoId: true,
    clienteId: true,
    localId: true,
    fecha: true,
    total: true,

    detalles: {
        select:{
            id: true,
            cantidad: true,
            precioSinIVA: true,
            descuento: true,
            precioFinal: true,
            stockId: true,
            productoId: true,
            ventaId: true,
            producto: {
                select:{
                    nombre : true,
                }
            }
        }
    },
    empleado: true,
    cliente: true,
    local: true


} satisfies Prisma.VentaSelect;