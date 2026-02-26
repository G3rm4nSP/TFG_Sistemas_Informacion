import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpleadoAusenciaDto } from './create-empleado-ausencia.dto';

export class UpdateEmpleadoAusenciaDto extends PartialType(CreateEmpleadoAusenciaDto) {}
