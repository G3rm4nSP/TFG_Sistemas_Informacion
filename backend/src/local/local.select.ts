import { Prisma } from "@prisma/client";

export const localSelect = {
    id: true,
    nombre: true,
    correo: true,
    telefono: true,
    nif: true,
    direccion: true,
    horarioApertura: true,
} as Prisma.LocalSelect;