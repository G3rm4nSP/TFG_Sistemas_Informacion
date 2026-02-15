import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { proveedorSelect } from './proveedor.select';

@Injectable()
export class ProveedorService {

  constructor (private primsa: PrismaService) {}

  async create(createProveedorDto: CreateProveedorDto) {
    
    const proveedor : Prisma.ProveedorCreateInput = {
      nombre: createProveedorDto.nombre,
      correo: createProveedorDto.correo,
      telefono: createProveedorDto.telefono,
      horarioEntrega: createProveedorDto.horarioEntrega,
      descripcion: createProveedorDto.descripcion,
    };

    return this.primsa.proveedor.create({data: proveedor, select: proveedorSelect});

  }

  async findAll() {

    return this.primsa.proveedor.findMany({select: proveedorSelect});
  
  }

  async findOne(id: string) {

    const proveedor = this.primsa.proveedor.findUnique({where: {id}, select: proveedorSelect});
    if (!proveedor) throw new NotFoundException('Proveedor no encontrado');
    return proveedor; 
  
  }

  async update(id: string, updateProveedorDto: UpdateProveedorDto) {
    
    try{
      
      const proveedor: Prisma.ProveedorUpdateInput = {...updateProveedorDto,}

      return await this.primsa.proveedor.update({where: {id}, data: proveedor, select: proveedorSelect});

    }catch (error: any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Proveedor no encontrado');
      throw error;

    }

  }

  async remove(id: string) {

    try{
      
      return await this.primsa.proveedor.delete({where: {id}, select: proveedorSelect});
      
    }catch (error: any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Proveedor no encontrado');
      throw error;

    }  

  }

}
