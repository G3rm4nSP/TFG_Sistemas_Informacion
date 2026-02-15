import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompraDetalleDto } from './dto/create-compra-detalle.dto';
import { UpdateCompraDetalleDto } from './dto/update-compra-detalle.dto';
import { compraDetalleSelect } from './compra-detalle.select';

@Injectable()
export class CompraDetalleService {

  constructor (private readonly prisma : PrismaService){}

  async create(createCompraDetalleDto: CreateCompraDetalleDto) {
    
    const compraDetalle : Prisma.CompraDetalleCreateInput = {
      ...createCompraDetalleDto,
      compra: {connect : { id : createCompraDetalleDto.compraId}},
      producto: {connect: {id : createCompraDetalleDto.productoId}},
    }

    return this.prisma.compraDetalle.create({data: compraDetalle, select: compraDetalleSelect});
  
  }

  async findAll() {
    return this.prisma.compraDetalle.findMany({select: compraDetalleSelect});
  }

  async findOne(compraId: string, productoId: string) {
    const compraDetalle = await this.prisma.compraDetalle.findUnique({where : {compraId_productoId : {compraId, productoId}},select: compraDetalleSelect});
    if(!compraDetalle) throw new NotFoundException (" Detalle de compra no encontrado.")
  }

  async update(compraId: string, productoId: string, updateCompraDetalleDto: UpdateCompraDetalleDto) {
    
    try {
      
      const compraDetalle : Prisma.CompraDetalleUpdateInput= {
        ...updateCompraDetalleDto,
        ...(updateCompraDetalleDto.compraId && {compra: {connect: {id : updateCompraDetalleDto.compraId}}}),
        ...(updateCompraDetalleDto.productoId && {producto: {connect : {id: updateCompraDetalleDto.productoId}}}),
      }

      return this.prisma.compraDetalle.update({where : {compraId_productoId : {compraId, productoId}}, data: compraDetalle, select: compraDetalleSelect});
      
    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Detalle de compra no encontrado');
      throw error;

    }

  }

  async remove(compraId: string, productoId: string) {
    
    try {
      
      return this.prisma.compraDetalle.delete({where : {compraId_productoId : {compraId, productoId}}, select: compraDetalleSelect});
      
    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Detalle de compra no encontrado');
      throw error;

    }

  }
}
