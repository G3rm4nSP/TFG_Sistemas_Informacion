export class CreateEmpleadoDto {
  localId!: string;
  nombre!: string;
  apellidos!: string;
  correo!: string;
  telefono?: string;
  dni!: string;
  direccion!: string;
  categoria!: string;
}