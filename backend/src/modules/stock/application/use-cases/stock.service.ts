import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma, Ubi } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateStockDto } from '../dto/create-stock.dto';
import { UpdateStockDto } from '../dto/update-stock.dto';
import { stockSelect } from '../../infrastructure/prisma/stock.select';
import { connect } from 'http2';
import { MoverStockDto } from '../dto/mover-stock.dto';

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

  async moverStock(
    origenId: string, moverStockDto: MoverStockDto,
  ){
    try {
      const origen = await this.prisma.stock.findUnique({
        where: { id:origenId },
      });

      if (!origen || origen.cantidad < moverStockDto.cantidad) {
        throw new BadRequestException('Stock insuficiente');
      }
      
      await this.prisma.$transaction([
        this.prisma.stock.update({
          where: {
            id : origen.id
          },
          data: {
            cantidad: {
              decrement: moverStockDto.cantidad,
            },
            valor: {
              decrement: moverStockDto.valor,
            },
          },
        }),

        this.prisma.stock.upsert({
          where: {
            productoId_ubicacionId: {
              productoId: moverStockDto.productoId,
              ubicacionId: moverStockDto.destinoUbicacionId,
            },
          },
          update: {
            cantidad: {
              increment: moverStockDto.cantidad,
            },
            valor: {
              increment: moverStockDto.valor,
            }
          },
          create: {
            productoId: moverStockDto.productoId,
            ubicacionId: moverStockDto.destinoUbicacionId,
            cantidad: moverStockDto.cantidad,
            valor: moverStockDto.valor,
          },
        }),
      ])
    } catch (error : any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Error moviendo el stock');
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
