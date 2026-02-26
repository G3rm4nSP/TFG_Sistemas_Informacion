import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateEmpleadoRrhhDto } from '../dto/create-empleado-rrhh.dto';
import { UpdateEmpleadoRrhhDto } from '../dto/update-empleado-rrhh.dto';
import { empleadoRRHHSelect } from '../../infrastructure/prisma/empleado-rrhh.select';
@Injectable()
export class EmpleadoRrhhService {

  constructor (private readonly prisma : PrismaService){}

  async create(createEmpleadoRrhhDto: CreateEmpleadoRrhhDto) {
    
    const {empleadoId, ...rest} = createEmpleadoRrhhDto;
    const empleadoRRHH : Prisma.EmpleadoRRHHCreateInput = {
      ...rest,
      empleado: {connect : {id : empleadoId}},
    };

    return this.prisma.empleadoRRHH.create({data: empleadoRRHH, select: empleadoRRHHSelect});

  }

  async findAll() {
    return this.prisma.empleadoRRHH.findMany({select:empleadoRRHHSelect});
  }

  async findOne(id: string) {
    const empleadoRRHH = await this.prisma.empleadoRRHH.findUnique({where : {empleadoId: id}, select: empleadoRRHHSelect});
    if (!empleadoRRHH) throw new NotFoundException ('RRHH de empleado no encontrado');
    return empleadoRRHH;
  }

  async update(id: string, updateEmpleadoRrhhDto: UpdateEmpleadoRrhhDto) {
    
    try {

      const { empleadoId, ...rest } = updateEmpleadoRrhhDto;
      const empleadoRRHH : Prisma.EmpleadoRRHHUpdateInput = {
        ...rest,
      };

      return await this.prisma.empleadoRRHH.update({where: {empleadoId: id}, data: empleadoRRHH, select: empleadoRRHHSelect});
      
    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('RRHH de empleado no encontrado.');
      throw error;
    
    }

  }

  async remove(id: string) {

    try {

      return await this.prisma.empleadoRRHH.delete({where: {empleadoId: id}, select: empleadoRRHHSelect});
      
    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('RRHH de empleado no encontrado.');
      throw error;
    
    }

  }

}
