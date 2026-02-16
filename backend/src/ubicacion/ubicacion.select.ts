import { Prisma } from '@prisma/client'

export const ubicacionSelect = {
    id : true,
    localId : true,
    tipo : true,
    descripcion : true,
} satisfies Prisma.UbicacionSelect;