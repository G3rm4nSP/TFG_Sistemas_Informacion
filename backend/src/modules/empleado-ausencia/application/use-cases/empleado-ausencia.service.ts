import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateEmpleadoAusenciaDto } from '../dto/create-empleado-ausencia.dto';
import { UpdateEmpleadoAusenciaDto } from '../dto/update-empleado-ausencia.dto';
import { empleadoAusenciaSelect } from '../../infrastructure/prisma/empleado-ausencia.select';

@Injectable()
export class EmpleadoAusenciaService {

  constructor (private readonly prisma : PrismaService){}

  async create(createEmpleadoAusenciaDto: CreateEmpleadoAusenciaDto) {
    
    const {empleadoId, ...rest} = createEmpleadoAusenciaDto;

    const empleadoAusencia : Prisma.EmpleadoAusenciaCreateInput = {
      ...rest,
      empleado: {connect : {id : empleadoId}},
    };

    return this.prisma.empleadoAusencia.create({data: empleadoAusencia, select: empleadoAusenciaSelect});

  }

  async findAll() {
    return this.prisma.empleadoAusencia.findMany({select:empleadoAusenciaSelect});
  }

  async findOne(id: string) {
    const empleadoAusencia = await this.prisma.empleadoAusencia.findUnique({where : {id}, select: empleadoAusenciaSelect});
    if (!empleadoAusencia) throw new NotFoundException ('Ausencia de empleado no encontrada');
    return empleadoAusencia;
  }

  async update(id: string, updateEmpleadoAusenciaDto: UpdateEmpleadoAusenciaDto) {
    
    try {

      const {empleadoId, ...rest} = updateEmpleadoAusenciaDto;

      const empleadoAusencia : Prisma.EmpleadoAusenciaUpdateInput = {
        ...rest,
        ...(empleadoId && {empleado: {connect : {id : empleadoId}}})
      };

      return await this.prisma.empleadoAusencia.update({where: {id}, data: empleadoAusencia, select: empleadoAusenciaSelect});
      
    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Ausencia de empleado no encontrada.');
      throw error;
    
    }

  }

  async remove(id: string) {

    try {

      return await this.prisma.empleadoAusencia.delete({where: {id}, select: empleadoAusenciaSelect});
      
    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Ausencia de empleado no encontrada.');
      throw error;
    
    }

  }

}
