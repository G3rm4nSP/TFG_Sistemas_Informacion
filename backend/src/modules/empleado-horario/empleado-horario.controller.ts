import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpleadoHorarioService } from './application/use-cases/empleado-horario.service';
import { CreateEmpleadoHorarioDto } from './application/dto/create-empleado-horario.dto';
import { UpdateEmpleadoHorarioDto } from './application/dto/update-empleado-horario.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('empleado-horario')
export class EmpleadoHorarioController {
  constructor(private readonly empleadoHorarioService: EmpleadoHorarioService) {}

  @Post()
  create(@Body() createEmpleadoHorarioDto: CreateEmpleadoHorarioDto) {
    return this.empleadoHorarioService.create(createEmpleadoHorarioDto);
  }

  @Get()
  findAll() {
    return this.empleadoHorarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empleadoHorarioService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmpleadoHorarioDto: UpdateEmpleadoHorarioDto) {
    return this.empleadoHorarioService.update(id, updateEmpleadoHorarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadoHorarioService.remove(id);
  }
}
