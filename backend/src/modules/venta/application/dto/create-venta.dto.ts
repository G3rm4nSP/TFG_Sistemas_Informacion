export class CreateVentaDto {
    empleadoId! : string;
    clienteId? : string;
    localId! :string;
    fecha! : Date;
    total! : number;
    stockId! : string;

    detalles! :{
        productoId: string,
        stockId: string;
        cantidad :number,
        precioSinIVA: number,
        descuento: number,
        precioFinal: number;
    }[]
}
