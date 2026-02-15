import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ubicacionSelect } from 'src/ubicacion/ubicacion.select';
import { usuarioSelect } from './usuario.select';

@Injectable()
export class UsuarioService {

  constructor (private readonly prisma : PrismaService){};

  async create(createUsuarioDto: CreateUsuarioDto) {
    
    const usuario : Prisma.UsuarioCreateInput = {
      ...createUsuarioDto,
      empleado : {connect :{id : createUsuarioDto.empleadoId}},
    };

    return this.prisma.usuario.create({data: usuario, select: usuarioSelect});
  }

  async findAll() {
    return this.prisma.usuario.findMany({select: usuarioSelect});
  }

  async findOne(id: string) {
    
    const usuario = await this.prisma.usuario.findUnique({where: {id}, select: usuarioSelect});
    if (!usuario) throw new NotFoundException ('Usuario no encontrado');
    return usuario;

  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    
    try {
      
      const usuario : Prisma.UsuarioUpdateInput = {
        ...updateUsuarioDto,
        ...(updateUsuarioDto.empleadoId && {empleado: {connect: {id : updateUsuarioDto.empleadoId}}}),
      };

      return this.prisma.usuario.update({where : {id}, data : usuario, select: usuarioSelect});

    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Venta no encontrada');
      throw error;

    }


  }

  async remove(id: string) {
    
    try {
      
      return this.prisma.usuario.delete({where : {id}, select: usuarioSelect});

    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Venta no encontrada');
      throw error;
            
    }
  }
}
