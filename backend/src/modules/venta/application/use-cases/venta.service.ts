import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateVentaDto } from '../dto/create-venta.dto';
import { UpdateVentaDto } from '../dto/update-venta.dto';
import { ventaSelect } from '../../infrastructure/prisma/venta.select';


@Injectable()
export class VentaService {
  
  constructor(private prisma: PrismaService) {}

  async create(createVentaDto: CreateVentaDto) {
    
    const {empleadoId, clienteId,detalles,localId, ...rest} = createVentaDto;
    
    return this.prisma.$transaction(async (tx) => {
      
      //comprobamos que todos los stocks tengan la cantidad indicada

      for (const detalle of detalles){
        const stock = await tx.stock.findUnique({
          where: { id: detalle.stockId }
        });

        if (!stock) {
          throw new NotFoundException(
            `Stock no encontrado para id ${detalle.stockId}`
          );
        }

        if (stock.cantidad < detalle.cantidad) {
          throw new BadRequestException(
            `No hay existencias suficientes para el producto ${stock.productoId}`
          );
        }
      }

      //creamos las ventas
      const venta = await tx.venta.create({
        data: {
          ...rest,
          empleado: {connect: {id: empleadoId}},
          cliente: clienteId ? { connect: { id: clienteId } }: undefined,
          local: {connect: {id: localId}},
          detalles: {
            create: detalles.map((detalle) => ({
              cantidad :detalle.cantidad,
              precioSinIVA: detalle.precioSinIVA,
              descuento: detalle.descuento,
              precioFinal: detalle.precioFinal,
              producto: { connect: { id: detalle.productoId } },
            })),
          },
        },
      });

      //actualizamos los stocks
      await Promise.all(
        detalles.map((detalle) =>
          tx.stock.update({
            where: { id: detalle.stockId },
            data: {
              cantidad: {
                decrement: detalle.cantidad,
              },
            },
          })
        )
      );

      return venta;

    });
  }

  async findAll() {
   
    return this.prisma.venta.findMany({select: ventaSelect});
  
  }

  async findOne(id: string) {
    
    const venta = await this.prisma.venta.findUnique({ where: { id }, select: ventaSelect,});
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return venta;
  
  }

  
    async update(ventaId: string, updateVentaDto: UpdateVentaDto) {
    
      throw new BadRequestException('Operacion no permitida: No se pueden modificar las ventas una vez creadas');
    
    }
  
    async remove(ventaId: string) {
           
      throw new BadRequestException('Operacion no permitida: No se pueden modificar las ventas una vez creadas');
  
    }
  }