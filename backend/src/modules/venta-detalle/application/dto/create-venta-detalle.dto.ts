export class CreateVentaDetalleDto {
    ventaId! : string;
    productoId! : string;
    cantidad! : number;
    precioSinIVA! : number;
    descuento? : number;
    precioFinal! : number;
}
