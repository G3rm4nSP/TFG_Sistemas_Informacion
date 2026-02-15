import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpleadoAusenciaDto } from './dto/create-empleado-ausencia.dto';
import { UpdateEmpleadoAusenciaDto } from './dto/update-empleado-ausencia.dto';
import { empleadoAusenciaSelect } from './empleado-ausencia.select';

@Injectable()
export class EmpleadoAusenciaService {

  constructor (private readonly prisma : PrismaService){}

  async create(createEmpleadoAusenciaDto: CreateEmpleadoAusenciaDto) {
    
    const empleadoAusencia : Prisma.EmpleadoAusenciaCreateInput = {
      ...createEmpleadoAusenciaDto,
      empleado: {connect : {id : createEmpleadoAusenciaDto.empleadoId}},
    };

    return this.prisma.empleadoAusencia.create({data: empleadoAusencia, select: empleadoAusenciaSelect});

  }

  async findAll() {
    return this.prisma.empleadoAusencia.findMany({select:empleadoAusenciaSelect});
  }

  async findOne(id: string) {
    const empleadoAusencia = await this.prisma.empleadoAusencia.findUnique({where : {id}, select: empleadoAusenciaSelect});
  }

  async update(id: string, updateEmpleadoAusenciaDto: UpdateEmpleadoAusenciaDto) {
    
    try {

      const empleadoAusencia : Prisma.EmpleadoAusenciaUpdateInput = {
        ...updateEmpleadoAusenciaDto,
        ...(updateEmpleadoAusenciaDto.empleadoId && {empleado: {connect : {id : updateEmpleadoAusenciaDto.empleadoId}}})
      };

      return await this.prisma.empleadoAusencia.update({where: {id}, data: empleadoAusencia, select: empleadoAusenciaSelect});
      
    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Ausencia de empleado no encontrado.');
      throw error;
    
    }

  }

  async remove(id: string) {

    try {

      return await this.prisma.empleadoAusencia.delete({where: {id}, select: empleadoAusenciaSelect});
      
    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Ausencia de empleado no encontrado.');
      throw error;
    
    }

  }

}
