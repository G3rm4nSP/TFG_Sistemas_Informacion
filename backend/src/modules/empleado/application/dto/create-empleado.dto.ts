import { Rol } from "@prisma/client";

export class CreateEmpleadoDto {
  //empleadobase
  localId!: string;
  nombre!: string;
  apellidos!: string;
  correo!: string;
  telefono?: string;
  dni!: string;
  direccion!: string;
  categoria!: string;

  //empleadorrhh
  salarioBase! : number;
  numPagas! : number;
  comision? : number;
  fechaCobro! : Date;
  fechaContrato! : Date;
  irpf! : number;
  numeroSeguridadSocial! : string;
  iban! : string;

  //usuario
  mail? : string;
  rol! : Rol;
}