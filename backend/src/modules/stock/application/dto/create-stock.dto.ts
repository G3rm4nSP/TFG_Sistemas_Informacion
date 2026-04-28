import {Ubicacion } from "@prisma/client";

export class CreateStockDto {
    productoId! : string;
    ubicacionId! : string;
    cantidad! : number;
    valor! : number;
    descuento? : number;
    updatedAt! : Date;
}
