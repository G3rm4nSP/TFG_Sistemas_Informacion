import { Prisma } from '@prisma/client';

export const proveedorSelect = {
    
    id: true,
    nombre: true,
    correo: true,
    telefono: true,
    horarioEntrega: true,
    descripcion: true,

} satisfies Prisma.ProveedorSelect;