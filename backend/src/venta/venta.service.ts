import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { ventaSelect } from './venta.select';
import { connect } from 'http2';

@Injectable()
export class VentaService {
  
  constructor(private prisma: PrismaService) {}

  async create(createVentaDto: CreateVentaDto) {
    
    const venta : Prisma.VentaCreateInput = {
      ...createVentaDto,
      empleado: {connect: {id: createVentaDto.empleadoId}},
      cliente: {connect: {id: createVentaDto.clienteId}},
    };

    return this.prisma.venta.create({data: venta, select: ventaSelect});

  }

  async findAll() {
   
    return this.prisma.venta.findMany({select: ventaSelect});
  
  }

  async findOne(id: string) {
    
    const venta = await this.prisma.venta.findUnique({ where: { id }, select: ventaSelect,});
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return venta;
  
  }

  async update(id: string, updateVentaDto: UpdateVentaDto) {
    
    try{

      const venta: Prisma.VentaUpdateInput = {
        ...updateVentaDto,
        ...(updateVentaDto.empleadoId && {empleado: { connect: { id: updateVentaDto.empleadoId }}}),
        ...(updateVentaDto.clienteId && {cliente: { connect: { id: updateVentaDto.clienteId }}}),
      }

      return await this.prisma.venta.update({where: {id}, data: venta, select: ventaSelect});

    }catch (error: any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Venta no encontrada');
      throw error;
    
    }
  
  }

  async remove(id: string) {
    
    try{

      return await this.prisma.venta.delete({where: {id}, select: ventaSelect});

    }catch (error: any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Venta no encontrada');
      throw error;
    
    }

  }

}
