import { PartialType } from '@nestjs/mapped-types';
import { CreateCompraDetalleDto } from './create-compra-detalle.dto';

export class UpdateCompraDetalleDto extends PartialType(CreateCompraDetalleDto) {}
