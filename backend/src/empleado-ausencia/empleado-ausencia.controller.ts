import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpleadoAusenciaService } from './empleado-ausencia.service';
import { CreateEmpleadoAusenciaDto } from './dto/create-empleado-ausencia.dto';
import { UpdateEmpleadoAusenciaDto } from './dto/update-empleado-ausencia.dto';

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
