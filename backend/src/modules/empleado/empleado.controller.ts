import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpleadoService } from './application/use-cases/empleado.service';
import { CreateEmpleadoDto } from './application/dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './application/dto/update-empleado.dto';
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
@Controller('empleado')
export class EmpleadoController {
  constructor(private readonly empleadoService: EmpleadoService) {}

  @Roles('RRHH ', 'ADMIN')
  @Post()
  create(@Body() createEmpleadoDto: CreateEmpleadoDto) {
    return this.empleadoService.create(createEmpleadoDto);
  }

  @Get()
  findAll(@User('rol') rol: string) {
    return this.empleadoService.findAll(rol);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User('rol') rol: string, @User('userId') usuarioId: string) {
    return this.empleadoService.findOne(id, rol, usuarioId);
  }

  @Roles('RRHH', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpleadoDto: UpdateEmpleadoDto) {
    return this.empleadoService.update(id, updateEmpleadoDto);
  }

  @Roles('RRHH', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoService.remove(id);
  }
}
