import { Prisma } from '@prisma/client';

export const productoSelect = {
    id: true,
    nombre: true,
    descripcion: true,
    tipo: true,
    porcentajeIva: true,
    precioBase: true,
    expiracion: true,} satisfies Prisma.ProductoSelect;