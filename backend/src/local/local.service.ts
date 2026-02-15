import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto as updateLocalDto } from './dto/update-local.dto';
import { localSelect } from './local.select';

@Injectable()
export class LocalService {
  
  constructor (private readonly prisma: PrismaService) {}

  async create(createLocalDto: CreateLocalDto) {
    
    const local : Prisma.LocalCreateInput = {... createLocalDto,};
    return this.prisma.local.create({data: local,select: localSelect,});

  }

  async findAll() {
    
    return this.prisma.local.findMany({select: localSelect});
  
  }

  async findOne(id: string) {
    
    const local = await this.prisma.local.findUnique({where: {id}, select: localSelect,});
    if (!local) throw new NotFoundException(`Local with ID ${id} not found`);
    return local;
  
  }

  async update(id: string, updateLocalDto: updateLocalDto) {
    
    try {

      const local : Prisma.LocalUpdateInput = {...updateLocalDto,};
      return this.prisma.local.update({where: {id}, data: local, select: localSelect,});
    
    }catch (error : any){
      
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException(`Local with ID ${id} not found`);
      throw error;
    
    }

  }

  async remove(id: string) {
    
    try {

      return this.prisma.local.delete({where: {id}, select: localSelect,});
    
    }catch (error : any){
      
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException(`Local with ID ${id} not found`);
      throw error;
    
    }

  }
  
}
