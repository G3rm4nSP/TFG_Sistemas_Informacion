import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCompraDto } from '../dto/create-compra.dto';
import { UpdateCompraDto } from '../dto/update-compra.dto';
import { compraSelect } from '../../infrastructure/prisma/compra.select';

@Injectable()
export class CompraService {

  constructor(private prisma: PrismaService) {} 
  
  async create(createCompraDto: CreateCompraDto) {
    
    const { proveedorId, localId, ...rest } = createCompraDto;

    const compra : Prisma.CompraCreateInput = {
      ...rest,
      proveedor: {connect: {id: proveedorId}},
      local: {connect: {id: localId}},
    };

    return this.prisma.compra.create({data: compra, select: compraSelect});
  
  }

  async findAll() {
    return this.prisma.compra.findMany({select: compraSelect});
  }

  async findOne(id: string) {
    const compra = await this.prisma.compra.findUnique({ where: { id }, select: compraSelect,});
    if (!compra) throw new NotFoundException('Compra no encontrada');
    return compra;
  }

  async update(id: string, updateCompraDto: UpdateCompraDto) {
    
    try{
    
      const { proveedorId, localId, ...rest } = updateCompraDto;

      const compra : Prisma.CompraUpdateInput = {
        ...rest,
        ...(proveedorId && {proveedor: { connect: { id: proveedorId }}}),
        ...(localId && {local: { connect: { id: localId }}}),
      };
      return await this.prisma.compra.update({where: {id}, data: compra, select: compraSelect});
    
    }catch (error: any) {
    
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Compra no encontrada');
      throw error;

    }

  }

  async remove(id: string) {
   
    try{
    
      return await this.prisma.compra.delete({where: {id}, select: compraSelect});
    
    }catch (error: any) {
    
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Compra no encontrada');
      throw error;

    }

  }
}
