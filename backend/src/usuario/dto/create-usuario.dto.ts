export class CreateUsuarioDto {
    empleadoId! : string;
    mail! : string;
    passwordHash! : string;
    rol! : string;
    ultimoAcceso! : Date;
}
