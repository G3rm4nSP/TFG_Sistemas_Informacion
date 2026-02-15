import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpleadoHorarioDto } from './dto/create-empleado-horario.dto';
import { UpdateEmpleadoHorarioDto } from './dto/update-empleado-horario.dto';
import { empleadoHorarioSelect } from './empleado-horario.select';

@Injectable()
export class EmpleadoHorarioService {

  constructor (private readonly prisma : PrismaService){}

  async create(createEmpleadoHorarioDto: CreateEmpleadoHorarioDto) {
    
    const empleadoHorario : Prisma.EmpleadoHorarioCreateInput = {
      ...createEmpleadoHorarioDto,
      empleado: {connect : {id : createEmpleadoHorarioDto.empleadoId}},
    };

    return this.prisma.empleadoHorario.create({data: empleadoHorario, select: empleadoHorarioSelect});

  }

  async findAll() {
    return this.prisma.empleadoHorario.findMany({select:empleadoHorarioSelect});
  }

  async findOne(id: string) {
    const empleadoHorario = await this.prisma.empleadoHorario.findUnique({where : {id}, select: empleadoHorarioSelect});
  }

  async update(id: string, updateEmpleadoHorarioDto: UpdateEmpleadoHorarioDto) {
    
    try {

      const empleadoHorario : Prisma.EmpleadoHorarioUpdateInput = {
        ...updateEmpleadoHorarioDto,
        ...(updateEmpleadoHorarioDto.empleadoId && {empleado: {connect : {id : updateEmpleadoHorarioDto.empleadoId}}})
      };

      return await this.prisma.empleadoHorario.update({where: {id}, data: empleadoHorario, select: empleadoHorarioSelect});
      
    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Horario de empleado no encontrado.');
      throw error;
    
    }

  }

  async remove(id: string) {

    try {

      return await this.prisma.empleadoHorario.delete({where: {id}, select: empleadoHorarioSelect});
      
    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Horario de empleado no encontrado.');
      throw error;
    
    }

  }

}
