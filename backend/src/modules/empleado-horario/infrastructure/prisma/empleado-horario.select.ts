import { Prisma } from "@prisma/client"

export const empleadoHorarioSelect = {
    id : true,
    empleadoId : true,
    diaSemana : true,
    horaInicio : true,
    horaFin : true,
} satisfies Prisma.EmpleadoHorarioSelect;