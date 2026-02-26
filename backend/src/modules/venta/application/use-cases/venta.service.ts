import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateVentaDto } from '../dto/create-venta.dto';
import { UpdateVentaDto } from '../dto/update-venta.dto';
import { ventaSelect } from '../../infrastructure/prisma/venta.select';
import { connect } from 'http2';

@Injectable()
export class VentaService {
  
  constructor(private prisma: PrismaService) {}

  async create(createVentaDto: CreateVentaDto) {
    
    const {empleadoId, clienteId, ...rest} = createVentaDto;
    const venta : Prisma.VentaCreateInput = {
      ...rest,
      empleado: {connect: {id: empleadoId}},
      cliente: {connect: {id: clienteId}},
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

      const {empleadoId, clienteId, ...rest} = updateVentaDto;
      const venta: Prisma.VentaUpdateInput = {
        ...rest,
        ...(empleadoId && {empleado: { connect: { id: empleadoId }}}),
        ...(clienteId && {cliente: { connect: { id: clienteId }}}),
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
