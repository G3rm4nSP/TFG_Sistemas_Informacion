import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpleadoHorarioDto } from './create-empleado-horario.dto';

export class UpdateEmpleadoHorarioDto extends PartialType(CreateEmpleadoHorarioDto) {}
