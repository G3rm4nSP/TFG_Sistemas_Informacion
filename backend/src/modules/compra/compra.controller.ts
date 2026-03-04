import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CompraService } from './application/use-cases/compra.service';
import { CreateCompraDto } from './application/dto/create-compra.dto';
import { UpdateCompraDto } from './application/dto/update-compra.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('compra')
export class CompraController {
  constructor(private readonly compraService: CompraService) {}

  @Post()
  create(@Body() createCompraDto: CreateCompraDto) {
    return this.compraService.create(createCompraDto);
  }

  @Get()
  findAll(
    @Query('proveedorId') proveedorId: string,
    @Query('localId') localId: string,) {
      return this.compraService.findAll( { proveedorId, localId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.compraService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompraDto: UpdateCompraDto) {
    return this.compraService.update(id, updateCompraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.compraService.remove(id);
  }
}
