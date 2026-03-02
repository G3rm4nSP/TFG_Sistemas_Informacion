import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProveedorService } from './application/use-cases/proveedor.service';
import { CreateProveedorDto } from './application/dto/create-proveedor.dto';
import { UpdateProveedorDto } from './application/dto/update-proveedor.dto';
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
@Controller('proveedor')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Roles ('JEFE', 'ADMIN')
  @Post()
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedorService.create(createProveedorDto);
  }

  @Get()
  findAll() {
    return this.proveedorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proveedorService.findOne(id);
  }

  @Roles ('JEFE', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProveedorDto: UpdateProveedorDto) {
    return this.proveedorService.update(id, updateProveedorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proveedorService.remove(id);
  }
}
