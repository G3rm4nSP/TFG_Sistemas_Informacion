import { Prisma } from "@prisma/client";

export const usuarioSelect = {
    id : true,
    empleadoId : true,
    mail : true,
    rol : true,
    ultimoAcceso : true,
} satisfies Prisma.UsuarioSelect;