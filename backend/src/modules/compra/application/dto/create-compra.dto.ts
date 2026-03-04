export class CreateCompraDto {
    proveedorId!: string;
    localId!: string;
    fecha!: Date;
    total!: number;

    detalles!: {
        productoId: string;
        cantidad: number;
        precioLote: number;
    }[];

    ubicacionId!: string;
    
}
