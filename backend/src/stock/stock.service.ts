import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { stockSelect } from './stock.select';
import { connect } from 'http2';

@Injectable()
export class StockService {

  constructor (private prisma : PrismaService) {}

  async create(createStockDto: CreateStockDto) {
    
    const {productoId, ubicacionId, ...rest} = createStockDto;
    const stock : Prisma.StockCreateInput = {
      ...rest,
      producto: {connect: {id: productoId}},
      ubicacion: {connect: {id: ubicacionId}},
    };

    return this.prisma.stock.create ({data:stock, select: stockSelect});
  }

  async findAll() {
    return this.prisma.stock.findMany({select:stockSelect});
  }

  async findOne(id: string) {
    
    const stock = await this.prisma.stock.findUnique({ where : {id}, select: stockSelect});
    if (!stock) throw new NotFoundException('Stock no encontrado');
    return stock;

  }

  async update(id: string, updateStockDto: UpdateStockDto) {

    try {

      const {productoId, ubicacionId, ...rest} = updateStockDto;
      const stock : Prisma.StockUpdateInput = {
        ...rest,
        ...(productoId && {producto: {connect: {id : productoId}}}),
        ...(ubicacionId && {ubicacion: {connect: {id : ubicacionId}}}),
      };

      return await this.prisma.stock.update({ where:{id},data: stock, select: stockSelect,});

    } catch (error : any){

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Stock no encontrado');
      throw error;

    }

  }

  async remove(id: string) {

    try {

      return await this.prisma.stock.delete({ where:{id}, select: stockSelect,});

    } catch (error : any){

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Stock no encontrado');
      throw error;

    }

  }
  
}
