import {Ubicacion } from "@prisma/client";

export class CreateStockDto {
    productoId! : string;
    ubicacionId! : string;
    cantidad! : number;
    descuento? : number;
    updatedAt! : Date;
}
