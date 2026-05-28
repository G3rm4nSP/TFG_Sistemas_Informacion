import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CompraService } from './application/use-cases/compra.service';
import { CreateCompraDto } from './application/dto/create-compra.dto';
import { UpdateCompraDto } from './application/dto/update-compra.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';


export const User = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as { userId: string; rol: string };
    return field ? user[field as keyof typeof user] : user;
  },
);
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('compra')
export class CompraController {
  constructor(private readonly compraService: CompraService) {}

  @Roles('JEFE', 'VENTAS')
  @Post()
  create(@Body() createCompraDto: CreateCompraDto) {
    return this.compraService.create(createCompraDto);
  }
  @Roles('JEFE', 'VENTAS')
  @Get()
  findAll(
    @Query('proveedorId') proveedorId: string,
    @Query('localId') localId: string,) {
      return this.compraService.findAll( { proveedorId, localId });
  }
  @Roles('JEFE', 'VENTAS')
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
