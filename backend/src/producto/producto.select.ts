import { Prisma } from '@prisma/client';

export const productoSelect = {
    id: true,
    nombre: true,
    descripcion: true,
    tipo: true,
    porcentajeIva: true,
    precioBase: true,
    expiracion: true,} as Prisma.ProductoSelect;