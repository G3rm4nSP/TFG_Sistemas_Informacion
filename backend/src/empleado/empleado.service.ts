import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { empleadoSelect } from './empleado.select';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmpleadoService {

  constructor(private readonly prisma: PrismaService) {}

  async create (createEmpleadoDto: CreateEmpleadoDto) {

    try {
      const claveRandom = Array.from({ length: 10 }, () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');

      const passwordHash = await bcrypt.hash(claveRandom, 10)
      
      const { 
        localId,
        salarioBase,
        numPagas,
        comision,
        fechaCobro,
        fechaContrato,
        irpf,
        numeroSeguridadSocial,
        iban,
        mail,
        rol,
          ...rest 
        } = createEmpleadoDto;

      const correoEmpresa = mail || createEmpleadoDto.correo;

      const empleado: Prisma.EmpleadoCreateInput = {
        ...rest,
        rrhh: {
          create : {
            salarioBase,
            numPagas,
            comision,
            fechaContrato:fechaContrato ? new Date(fechaContrato): new Date(),
            fechaCobro: fechaCobro ? new Date(fechaCobro) : new Date(new Date().setDate(new Date().getDate() + 30)),
            irpf,
            numeroSeguridadSocial,
            iban,
          }
        },
        usuario: {
          create : {
            mail : correoEmpresa,
            passwordHash,
            rol : rol,
            activo: true,
            intentosFallidos : 0,
          }
        },
        local: { connect: {id: localId}},
      };
      
      const empleadoCreado = await this.prisma.empleado.create({data: empleado, select: empleadoSelect});
      
      return  {...empleadoCreado, correoEmpresa, claveRandom}

    } catch (error : any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint failed
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[])?.join(', ') || 'campo único';
          throw new ConflictException(`Ya existe un registro con ${target}`);
        }
      }
      // Otros errores inesperados
      throw new InternalServerErrorException(error.message);
    }
    
  }

  async findAll(rol : string){

    const baseSelect = {
      id: true,
      nombre: true,
      apellidos: true,
      correo: true,
      telefono: true,
      dni: true,
      direccion: true,
      activo: true,
      categoria: true,
      localId: true,
      local: {
        select: {
          id: true,
          nombre: true,
        }
      }
    };

    let select;

    if (rol === 'RRHH') {
      select = { ...baseSelect, rrhh: empleadoSelect.rrhh };

    } else if (rol === 'JEFE') {
      select = baseSelect; 

    } else {
      select = {
        id: true,
        localId: true,
        nombre: true,
        apellidos: true,
        correo: true,
        categoria: true,
        activo: true,
        local: {
        select: {
          id: true,
          nombre: true,
        }
      }
      };
    }

    return this.prisma.empleado.findMany({select: select});

  }

  async findOne(id: string, rol : string, usuarioId : string) {

     const baseSelect = {
      id: true,
      nombre: true,
      apellidos: true,
      correo: true,
      telefono: true,
      dni: true,
      direccion: true,
      activo: true,
      categoria: true,
      localId: true,
      local: {
        select: {
          id: true,
          nombre: true,
        }
      }
    };

    let select;

    if (rol === 'RRHH') {
      select = { ...baseSelect, rrhh: empleadoSelect.rrhh };

    } else if (rol === 'JEFE') {
      select = baseSelect; 

    } else {
      select = {
        id: true,
        localId: true,
        nombre: true,
        apellidos: true,
        correo: true,
        categoria: true,
        activo : true,
        local: {
          select: {
            id: true,
            nombre: true,
          }
        }
      };
    }

    const empleado = await this.prisma.empleado.findUnique({where: {id}, select: select});
    if (!empleado) throw new NotFoundException('Empleado no encontrado');
    return empleado;

  }

  async update(id: string, updateEmpleadoDto: UpdateEmpleadoDto) {
    
    try {

      const { 
        localId,
        salarioBase,
        numPagas,
        comision,
        fechaCobro,
        fechaContrato,
        irpf,
        numeroSeguridadSocial,
        iban,
        mail,
        rol,
        ...rest 
      } = updateEmpleadoDto;

      const empleado: Prisma.EmpleadoUpdateInput = {
        ...rest,
        ...(localId && {local: { connect: { id: localId }}}),
        rrhh: {
          update: {
            ...(salarioBase !== undefined && { salarioBase }),
            ...(numPagas !== undefined && { numPagas }),
            ...(comision !== undefined && { comision }),
            ...(fechaCobro && { fechaCobro }),
            ...(fechaContrato && { fechaContrato }),
            ...(irpf !== undefined && { irpf }),
            ...(numeroSeguridadSocial && { numeroSeguridadSocial }),
            ...(iban && { iban }),
          }
        }
      }

      return await this.prisma.empleado.update({where: { id }, data: empleado, select: empleadoSelect});

    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Empleado no encontrado');
      throw error;
    }

  }

  async remove(id: string) {

    try {

      return await this.prisma.empleado.update({where: {id},data: {activo:false}, select: empleadoSelect});

    
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') throw new NotFoundException('Empleado no encontrado');
      throw error;
    }
  }
}


