import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ubicacionSelect } from '../ubicacion/ubicacion.select';
import { usuarioSelect } from './usuario.select';

@Injectable()
export class UsuarioService {

  constructor (private readonly prisma : PrismaService){};

  async create(createUsuarioDto: CreateUsuarioDto) {
    
    const {empleadoId, ...rest} = createUsuarioDto;
    const usuario : Prisma.UsuarioCreateInput = {
      ...rest,
      empleado : {connect :{id : empleadoId}},
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
      
      const {empleadoId, ...rest} = updateUsuarioDto;
      const usuario : Prisma.UsuarioUpdateInput = {...rest,};

      return await this.prisma.usuario.update({where : {id}, data : usuario, select: usuarioSelect});

    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Usuario no encontrado');
      throw error;

    }


  }

  async remove(id: string) {
    
    try {
      
      return await this.prisma.usuario.delete({where : {id}, select: usuarioSelect});

    } catch (error : any) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Usuario no encontrado');
      throw error;
            
    }
  }
}
