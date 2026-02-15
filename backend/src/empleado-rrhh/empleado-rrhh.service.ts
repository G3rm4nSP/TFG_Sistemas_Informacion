import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmpleadoRrhhDto } from './dto/create-empleado-rrhh.dto';
import { UpdateEmpleadoRrhhDto } from './dto/update-empleado-rrhh.dto';
import { empleadoRRHHSelect } from './empleado-rrhh.select';
@Injectable()
export class EmpleadoRRHHService {

  constructor (private readonly prisma : PrismaService){}

  async create(createEmpleadoRrhhDto: CreateEmpleadoRrhhDto) {
    
    const empleadoRRHH : Prisma.EmpleadoRRHHCreateInput = {
      ...createEmpleadoRrhhDto,
      empleado: {connect : {id : createEmpleadoRrhhDto.empleadoId}},
    };

    return this.prisma.empleadoRRHH.create({data: empleadoRRHH, select: empleadoRRHHSelect});

  }

  async findAll() {
    return this.prisma.empleadoRRHH.findMany({select:empleadoRRHHSelect});
  }

  async findOne(id: string) {
    const empleadoRRHH = await this.prisma.empleadoRRHH.findUnique({where : {empleadoId: id}, select: empleadoRRHHSelect});
  }

  async update(id: string, updateEmpleadoRrhhDto: UpdateEmpleadoRrhhDto) {
    
    try {

      const empleadoRRHH : Prisma.EmpleadoRRHHUpdateInput = {
        ...updateEmpleadoRrhhDto,
        ...(updateEmpleadoRrhhDto.empleadoId && {empleado: {connect : {id : updateEmpleadoRrhhDto.empleadoId}}})
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
