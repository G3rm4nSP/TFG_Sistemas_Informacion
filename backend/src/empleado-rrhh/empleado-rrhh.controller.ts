import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpleadoRrhhService } from './empleado-rrhh.service';
import { CreateEmpleadoRrhhDto } from './dto/create-empleado-rrhh.dto';
import { UpdateEmpleadoRrhhDto } from './dto/update-empleado-rrhh.dto';

@Controller('empleado-rrhh')
export class EmpleadoRrhhController {
  constructor(private readonly empleadoRrhhService: EmpleadoRrhhService) {}

  @Post()
  create(@Body() createEmpleadoRrhhDto: CreateEmpleadoRrhhDto) {
    return this.empleadoRrhhService.create(createEmpleadoRrhhDto);
  }

  @Get()
  findAll() {
    return this.empleadoRrhhService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empleadoRrhhService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpleadoRrhhDto: UpdateEmpleadoRrhhDto) {
    return this.empleadoRrhhService.update(id, updateEmpleadoRrhhDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoRrhhService.remove(id);
  }
}
