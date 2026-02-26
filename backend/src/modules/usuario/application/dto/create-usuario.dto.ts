import { Rol } from '@prisma/client';
export class CreateUsuarioDto {
    empleadoId! : string;
    mail! : string;
    passwordHash! : string;
    rol! : Rol;
    ultimoAcceso! : Date;
    activo? : boolean;
    intentosFallidos! : number;
    bloqueadoHasta! : Date;
}

