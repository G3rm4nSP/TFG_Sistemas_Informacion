import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';
import { productoSelect } from '../../infrastructure/prisma/producto.select';

@Injectable()
export class ProductoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto) {

    const producto : Prisma.ProductoCreateInput = {...createProductoDto,};
    return this.prisma.producto.create({data: producto, select: productoSelect});
    
  }

  async findAll() {
    
    return this.prisma.producto.findMany({select: productoSelect});
  
  }

  async findOne(id: string) {
    
    const producto = await this.prisma.producto.findUnique({where: {id}, select: productoSelect});
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  
  }

  async update(id: string, updateProductoDto: UpdateProductoDto) {
  
    try {
    
      const producto: Prisma.ProductoUpdateInput = {...updateProductoDto,};
      return await this.prisma.producto.update({where: {id}, data: producto, select: productoSelect});
    
    } catch (error: any) {
     
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Producto no encontrado');
      throw error;
    
    }
  
  }

  async remove(id: string) {
    
    try {
    
      return await this.prisma.producto.delete({where: {id}, select: productoSelect});
    
    } catch (error: any) {
    
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Producto no encontrado');
      throw error;
    
    }
  
  }

}
