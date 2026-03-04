import { Prisma } from "@prisma/client";

export const usuarioSelect = {
    id : true,
    empleadoId : true,
    mail : true,
    rol : true,
    ultimoAcceso : true,
    activo : true,
    intentosFallidos : true,
    bloqueadoHasta : true,
    empleado : {
        select: {
            nombre: true,
            apellidos: true,
            localId: true,
        }
    }
} satisfies Prisma.UsuarioSelect;