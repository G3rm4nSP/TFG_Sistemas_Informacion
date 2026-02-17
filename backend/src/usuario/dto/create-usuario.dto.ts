export class CreateUsuarioDto {
    empleadoId! : string;
    mail! : string;
    passwordHash! : string;
    rol! : string;
    ultimoAcceso! : Date;
    activo? : boolean;
    intentosFallidos! : number;
    bloqueadoHasta! : Date;
}
