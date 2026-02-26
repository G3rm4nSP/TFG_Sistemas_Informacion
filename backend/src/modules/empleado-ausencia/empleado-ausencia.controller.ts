import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpleadoAusenciaService } from './application/use-cases/empleado-ausencia.service';
import { CreateEmpleadoAusenciaDto } from './application/dto/create-empleado-ausencia.dto';
import { UpdateEmpleadoAusenciaDto } from './application/dto/update-empleado-ausencia.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('empleado-ausencia')
export class EmpleadoAusenciaController {
  constructor(private readonly empleadoAusenciaService: EmpleadoAusenciaService) {}

  @Post()
  create(@Body() createEmpleadoAusenciaDto: CreateEmpleadoAusenciaDto) {
    return this.empleadoAusenciaService.create(createEmpleadoAusenciaDto);
  }

  @Get()
  findAll() {
    return this.empleadoAusenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empleadoAusenciaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpleadoAusenciaDto: UpdateEmpleadoAusenciaDto) {
    return this.empleadoAusenciaService.update(id, updateEmpleadoAusenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoAusenciaService.remove(id);
  }
}
