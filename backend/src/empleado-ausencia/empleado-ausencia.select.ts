import { Prisma } from "@prisma/client"

export const empleadoAusenciaSelect = {
    id : true,
    empleadoId : true,
    tipo : true,
    fechaInicio : true,
    fechaFin : true,
    observaciones : true,
} satisfies Prisma.EmpleadoAusenciaSelect;