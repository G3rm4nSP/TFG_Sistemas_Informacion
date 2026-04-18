import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma, Ubi } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCompraDto } from '../dto/create-compra.dto';
import { UpdateCompraDto } from '../dto/update-compra.dto';
import { compraSelect } from '../../infrastructure/prisma/compra.select';

@Injectable()
export class CompraService {

  constructor(private prisma: PrismaService) {} 
  
  async create(createCompraDto: CreateCompraDto) {

  const { proveedorId, localId, detalles, ...rest } = createCompraDto;

    return this.prisma.$transaction(async (tx) => {

      // 1️⃣ Buscar ubicación tipo ALMACEN del local
      const ubicacionAlmacen = await tx.ubicacion.findFirst({
        where: {
          localId,
          tipo: Ubi.ALMACEN,
          descripcion: 'ENTREGAS'
        },
      });

      if (!ubicacionAlmacen) {
        throw new BadRequestException(
          'No existe ubicación de tipo ALMACEN para este local'
        );
      }

      // 2️⃣ Crear compra
      const compra = await tx.compra.create({
        data: {
          ...rest,
          proveedor: { connect: { id: proveedorId } },
          local: { connect: { id: localId } },
          detalles: {
            create: detalles.map((detalle) => ({
              cantidad: detalle.cantidad,
              precioUnidad: detalle.precioUnidad,
              producto: { connect: { id: detalle.productoId } },
            })),
          },
        },
      });

      // 3️⃣ Actualizar stock por cada detalle
      for (const detalle of detalles) {

        await tx.stock.upsert({
          where: {
            productoId_ubicacionId: {
              productoId: detalle.productoId,
              ubicacionId: ubicacionAlmacen.id,
            },
          },
          update: {
            cantidad: {
              increment: detalle.cantidad,
            },
          },
          create: {
            productoId: detalle.productoId,
            ubicacionId: ubicacionAlmacen.id,
            cantidad: detalle.cantidad,
          },
        });

      }

      return compra;
    });
  }

  async findAll(filters: { proveedorId?: string; localId?: string;}) {
    return this.prisma.compra.findMany({
      where: {
        ...(filters.proveedorId && { proveedorId: filters.proveedorId }),
        ...(filters.localId && { localId: filters.localId }),
      },select: compraSelect,
    });
  }

  async findOne(id: string) {
    const compra = await this.prisma.compra.findUnique({ where: { id }, select: compraSelect,});
    if (!compra) throw new NotFoundException('Compra no encontrada');
    return compra;
  }

  async update(id: string, updateCompraDto: UpdateCompraDto) {
    
     throw new BadRequestException('Operacion no permitida: No se pueden modificar las compras una vez creadas');


  }

  async remove(id: string) {
   
     throw new BadRequestException('Operacion no permitida: No se pueden eliminar las compras una vez creadas');

  }
}
