export class CreateEmpleadoRrhhDto {
    empleadoId! : string;
    salarioBase! : number;
    numPagas! : number;
    comision? : number;
    fechaCobro! : Date;
    fechaContrato! : Date;
    irpf! : number;
    numeroSeguridadSocial! : string;
    iban! : string;
}
