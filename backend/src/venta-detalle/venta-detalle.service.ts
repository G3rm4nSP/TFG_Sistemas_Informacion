import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVentaDetalleDto } from './dto/create-venta-detalle.dto';
import { UpdateVentaDetalleDto } from './dto/update-venta-detalle.dto';
import { ventaDetalleSelect } from './venta-detalle.select';

@Injectable()
export class VentaDetalleService {

  constructor (private readonly prisma : PrismaService){};

  async create(createVentaDetalleDto: CreateVentaDetalleDto) {
    
    const ventaDetalle : Prisma.VentaDetalleCreateInput = {
      ...createVentaDetalleDto,
      venta : {connect : {id : createVentaDetalleDto.ventaId}},
      producto : {connect : { id : createVentaDetalleDto.productoId}}, 
    };

    return this.prisma.ventaDetalle.create({data: ventaDetalle, select: ventaDetalleSelect});
  
  }

  async findAll() {
    return this.prisma.ventaDetalle.findMany({select: ventaDetalleSelect});
  }

  async findOne(ventaId: string, productoId: string) {
    
    const ventaDetalle = await this.prisma.ventaDetalle.findUnique({where : {ventaId_productoId : {ventaId, productoId}}, select: ventaDetalleSelect});
    if (!ventaDetalle) throw new NotFoundException ('Detalle de venta no encontrado.');
    return ventaDetalle;
  
  }

  async update(ventaId: string, productoId: string, updateVentaDetalleDto: UpdateVentaDetalleDto) {
    
    try {

      const ventaDetalle : Prisma.VentaDetalleUpdateInput = {
        ...updateVentaDetalleDto,
        ...(updateVentaDetalleDto.ventaId && {venta: {connect : {id : updateVentaDetalleDto.ventaId}}}),
        ...(updateVentaDetalleDto.productoId && {producto: {connect : {id : updateVentaDetalleDto.productoId}}}),
      }
      
      return await this.prisma.ventaDetalle.update({where : {ventaId_productoId : {ventaId, productoId}}, data: ventaDetalle, select: ventaDetalleSelect});

    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Detalle de venta no encontrado');
      throw error;

    }
  
  }

  async remove(ventaId: string, productoId: string) {
    
    try {

      return await this.prisma.ventaDetalle.delete({where : {ventaId_productoId : {ventaId, productoId}},select: ventaDetalleSelect});

    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Detalle de venta no encontrado');
      throw error;

    }

  }
}
