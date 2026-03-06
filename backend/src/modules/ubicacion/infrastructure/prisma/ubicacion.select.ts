import { Prisma } from '@prisma/client'

export const ubicacionSelect = {
    id : true,
    localId : true,
    tipo : true,
    descripcion : true,
    local : {
        select:{
            nombre : true,
        },
    },
} satisfies Prisma.UbicacionSelect;