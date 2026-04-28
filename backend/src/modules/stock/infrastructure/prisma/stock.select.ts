import { Prisma } from '@prisma/client';

export const stockSelect = {
    id: true,
    productoId: true,
    ubicacionId: true,
    cantidad: true,
    valor: true,
    descuento: true,
    updatedAt: true,
    producto : true,
    ubicacion :  {
        select:{
            localId : true,
            tipo : true,
            descripcion : true,
            local: {
                select: {
                    nombre : true,
                }
            }
        },

    },
} satisfies Prisma.StockSelect;