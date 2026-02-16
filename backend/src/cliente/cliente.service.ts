import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { clienteSelect } from './cliente.select';

@Injectable()
export class ClienteService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
  
    const cliente : Prisma.ClienteCreateInput = {... createClienteDto,};
    return this.prisma.cliente.create({data: cliente, select: clienteSelect});
  
  }

  async findAll() {
  
    return this.prisma.cliente.findMany({select: clienteSelect});
  
  }

  async findOne(id: string) {
    
    const cliente = await this.prisma.cliente.findUnique({where: {id}, select: clienteSelect});
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  
  }

  async update(id: string, updateClienteDto: UpdateClienteDto) {
    
    try{
      const cleinte: Prisma.ClienteUpdateInput = {
        ...updateClienteDto,
      }

      return await this.prisma.cliente.update({where: {id}, data: cleinte, select: clienteSelect});

    }catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Cliente no encontrado');
      throw error;
    }

  }

  async remove(id: string) {

    try {

      return await this.prisma.cliente.delete({where: {id}, select: clienteSelect});

    } catch (error: any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Cliente no encontrado');
      throw error;
    
    }

  }

}
