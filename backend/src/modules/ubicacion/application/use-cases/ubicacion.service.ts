import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateUbicacionDto } from '../dto/create-ubicacion.dto';
import { UpdateUbicacionDto } from '../dto/update-ubicacion.dto';
import { ubicacionSelect } from '../../infrastructure/prisma/ubicacion.select';

@Injectable()
export class UbicacionService {

  constructor (private readonly prisma : PrismaService){};

  async create(createUbicacionDto: CreateUbicacionDto) {
    
    const {localId, ...rest} = createUbicacionDto;
    const ubicacion : Prisma.UbicacionCreateInput = {
      ...rest,
      local: {connect: {id: localId}},
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

      const {localId, ...rest} = updateUbicacionDto;
      const ubicacion : Prisma.UbicacionUpdateInput = {
        ...rest,
        ...(localId && {local : {connect: {id : localId}}}),
      };

      return await this.prisma.ubicacion.update({where:{id},data:ubicacion,select:ubicacionSelect});

    }catch(error : any){

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Ubicacion no encontrada');
      throw error;

    }
  }

  async remove(id: string) {
    try{

      return await this.prisma.ubicacion.delete({where:{id},select:ubicacionSelect});

    }catch(error : any){

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Ubicacion no encontrada');
      throw error;

    }
  }
}
