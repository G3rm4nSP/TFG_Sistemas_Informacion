import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUbicacionDto } from './dto/create-ubicacion.dto';
import { UpdateUbicacionDto } from './dto/update-ubicacion.dto';
import { ubicacionSelect } from './ubicacion.select';

@Injectable()
export class UbicacionService {

  constructor (private readonly prisma : PrismaService){};

  async create(createUbicacionDto: CreateUbicacionDto) {
    
    const ubicacion : Prisma.UbicacionCreateInput = {
      ...createUbicacionDto,
      local: {connect: {id: createUbicacionDto.localId}},
    };

    return this.prisma.ubicacion.create({data: ubicacion, select: ubicacionSelect});
  
  }

  async findAll() {

    return this.prisma.ubicacion.findMany({select: ubicacionSelect});
  
  }

  async findOne(id: string) {
    
    const ubicacion = await this.prisma.ubicacion.findUnique({where: {id}, select: ubicacionSelect});
    if (!ubicacion) throw new NotFoundException('Ubicacion no encotrada');
    return ubicacion;
  }

  async update(id: string, updateUbicacionDto: UpdateUbicacionDto) {
    try{

      const ubicacion : Prisma.UbicacionUpdateInput = {
        ...updateUbicacionDto,
        ...(updateUbicacionDto.localId && {local : {connect: {id : updateUbicacionDto.localId}}}),
      };

      return await this.prisma.ubicacion.update({where:{id},data:ubicacion,select:ubicacionSelect});

    }catch(error : any){

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Venta no encontrada');
      throw error;

    }
  }

  async remove(id: string) {
    try{

      return await this.prisma.ubicacion.delete({where:{id},select:ubicacionSelect});

    }catch(error : any){

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Venta no encontrada');
      throw error;

    }
  }
}
