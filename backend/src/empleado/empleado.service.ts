import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { empleadoSelect } from './empleado.select';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmpleadoService {

  constructor(private prisma: PrismaService) {}

  async create (dto: CreateEmpleadoDto) {

    const empleado: Prisma.EmpleadoCreateInput = {
      nombre: dto.nombre,
      apellidos: dto.apellidos,
      correo: dto.correo,
      telefono: dto.telefono,
      dni: dto.dni,
      direccion: dto.direccion,
      categoria: dto.categoria,
      local: { connect: {id: dto.localId}},
    };

    return this.prisma.empleado.create({data: empleado,select: empleadoSelect});
  }

  async findAll(){

    return this.prisma.empleado.findMany({select: empleadoSelect});

  }

  async findOne(id: string) {

    const empleado = await this.prisma.empleado.findUnique({where: {id}, select: empleadoSelect});
    if (!empleado) throw new NotFoundException('Empleado no encontrado');
    return empleado;

  }

  async update(id: string, dto: UpdateEmpleadoDto) {
    
    try {

      const empleado: Prisma.EmpleadoUpdateInput = {
        ...dto,
        ...(dto.localId && {local: { connect: { id: dto.localId }}}),
      }

      return await this.prisma.empleado.update({where: { id }, data: empleado, select: empleadoSelect});

    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Empleado no encontrado');
      throw error;
    }

  }

  async remove(id: string) {

    try {

      return await this.prisma.empleado.delete({where: {id}, select: empleadoSelect});

    
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Empleado no encontrado');
      throw error;
    }
  }
}


