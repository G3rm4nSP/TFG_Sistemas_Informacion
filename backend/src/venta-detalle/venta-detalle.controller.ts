import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VentaDetalleService } from './venta-detalle.service';
import { CreateVentaDetalleDto } from './dto/create-venta-detalle.dto';
import { UpdateVentaDetalleDto } from './dto/update-venta-detalle.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('venta-detalle')
export class VentaDetalleController {
  constructor(private readonly ventaDetalleService: VentaDetalleService) {}

  @Post()
  create(@Body() createVentaDetalleDto: CreateVentaDetalleDto) {
    return this.ventaDetalleService.create(createVentaDetalleDto);
  }

  @Get()
  findAll() {
    return this.ventaDetalleService.findAll();
  }

  @Get(':ventaId/:productoId')
  findOne(
    @Param('ventaId') ventaId: string,
    @Param('productoId') productoId: string,
  ) {
    return this.ventaDetalleService.findOne(ventaId,productoId);
  }

  @Patch(':ventaId/:productoId')
  update(
    @Param('ventaId') ventaId: string,
    @Param('productoId') productoId: string,
    @Body() updateVentaDetalleDto: UpdateVentaDetalleDto,
  ) {
    return this.ventaDetalleService.update(
      ventaId,
      productoId,
      updateVentaDetalleDto,
    );
  }

  @Delete(':ventaId/:productoId')
  remove(
    @Param('ventaId') ventaId: string,
    @Param('productoId') productoId: string,
  ) {
    return this.ventaDetalleService.remove(ventaId,productoId);
  }
}
