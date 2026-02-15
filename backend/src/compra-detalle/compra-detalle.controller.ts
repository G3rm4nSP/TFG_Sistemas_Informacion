import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompraDetalleService } from './compra-detalle.service';
import { CreateCompraDetalleDto } from './dto/create-compra-detalle.dto';
import { UpdateCompraDetalleDto } from './dto/update-compra-detalle.dto';

@Controller('compra-detalle')
export class CompraDetalleController {
  constructor(private readonly compraDetalleService: CompraDetalleService) {}

  @Post()
  create(@Body() createCompraDetalleDto: CreateCompraDetalleDto) {
    return this.compraDetalleService.create(createCompraDetalleDto);
  }

  @Get()
  findAll() {
    return this.compraDetalleService.findAll();
  }

  @Get(':compraId/:productoId')
  findOne(
    @Param('compraId') compraId: string,
    @Param('productoId') productoId: string,
  ) {
    return this.compraDetalleService.findOne(compraId,productoId);
  }

  @Patch(':compraId/:productoId')
  update(
    @Param('compraId') compraId: string,
    @Param('productoId') productoId: string, 
    @Body() updateCompraDetalleDto: UpdateCompraDetalleDto) {
    return this.compraDetalleService.update(compraId,productoId, updateCompraDetalleDto);
  }

  @Delete(':compraId/:productoId')
  remove(
    @Param('compraId') compraId: string,
    @Param('productoId') productoId: string,
  ) {
    return this.compraDetalleService.remove(compraId,productoId);
  }
}
