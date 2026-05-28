export class CreateCompraDto {
    proveedorId!: string;
    empleadoId!: string;
    localId!: string;
    fecha!: Date;
    total!: number;

    detalles!: {
        productoId: string;
        cantidad: number;
        precioUnidad: number;
    }[];

    ubicacionId!: string;
    
}
