import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpleadoRrhhDto } from './create-empleado-rrhh.dto';

export class UpdateEmpleadoRrhhDto extends PartialType(CreateEmpleadoRrhhDto) {}
