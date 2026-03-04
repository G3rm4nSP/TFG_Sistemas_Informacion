import { Ubi } from '@prisma/client';
export class CreateUbicacionDto {
    localId! : string;
    tipo! : Ubi ;
    descripcion!: string;
}

