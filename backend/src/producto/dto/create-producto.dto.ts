export class CreateProductoDto {
    nombre: string;
    descripcion: string;
    tipo: string;
    porcentajeIVA: number;
    precioBase: number;
    expiracion?: Date;
}
