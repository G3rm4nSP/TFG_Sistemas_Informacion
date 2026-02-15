import { Prisma } from '@prisma/client'

export const ubicacionSelect = {
    id : true,
    loclalId : true,
    tipo : true,
    descripcion : true,
} satisfies Prisma.UbicacionSelect;